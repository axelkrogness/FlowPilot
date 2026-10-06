import {db} from './db';
import {decrypt} from './crypto';

type N={id:string,type?:string,data?:any}; type E={source:string,target:string,sourceHandle?:string};
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function interpolate(v:any,ctx:any):any{if(typeof v==='string')return v.replace(/\{\{\s*([^}]+)\s*\}\}/g,(_,p)=>String(p.trim().split('.').reduce((a:any,k:string)=>a?.[k],ctx)??''));if(Array.isArray(v))return v.map(x=>interpolate(x,ctx));if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,interpolate(x,ctx)]));return v}
async function executeNode(type:string,cfg:any,ctx:any,executionId:string,node:N){
 if(type==='trigger') return {triggered:true};
 if(type==='http'){const r=await fetch(cfg.url,{method:cfg.method||'GET',headers:cfg.headers||{},body:['GET','HEAD'].includes((cfg.method||'GET').toUpperCase())?undefined:JSON.stringify(cfg.body||{})});const text=await r.text();let body:any=text;try{body=JSON.parse(text)}catch{}if(!r.ok)throw new Error(`HTTP ${r.status}`);return {status:r.status,body}}
 if(type==='condition'){const left=interpolate(cfg.left??cfg.path??'',ctx),right=interpolate(cfg.right??cfg.value??'',ctx);const op=cfg.operator||'equals';return {result:op==='!='||op==='notEquals'?left!=right:op==='contains'?String(left).includes(String(right)):left==right}}
 if(type==='ai'){const key=process.env.OPENAI_API_KEY;if(!key)throw new Error('OPENAI_API_KEY missing');const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:cfg.model||'gpt-5-mini',input:String(cfg.prompt||'')})});if(!r.ok)throw new Error(`AI request failed ${r.status}`);return r.json()}
 if(type==='database'){
   // Allow-listed application DB adapter: workflows cannot submit arbitrary SQL.
   if(cfg.resource==='notifications'&&cfg.operation==='create'){if(!cfg.userId||!cfg.title)throw new Error('notifications.create requires userId and title');return db.notification.create({data:{userId:String(cfg.userId),title:String(cfg.title),body:String(cfg.body||'')}})}
   if(cfg.resource==='notifications'&&cfg.operation==='list'){return db.notification.findMany({where:cfg.userId?{userId:String(cfg.userId)}:{},take:Math.min(Number(cfg.limit||20),100),orderBy:{createdAt:'desc'}})}
   throw new Error('Unsupported database adapter. Allowed: notifications.create, notifications.list');
 }
 return {ok:true};
}
export async function runExecution(id:string){
 const ex=await db.execution.findUnique({where:{id},include:{workflow:true,version:true}});if(!ex)throw new Error('Execution not found');
 const graph:any=ex.version?.graph??ex.workflow.draftGraph,nodes:N[]=graph?.nodes||[],edges:E[]=graph?.edges||[];
 let ctx:any=(ex.context as any)||{input:ex.input||{},steps:{}};ctx.input=ctx.input||ex.input||{};ctx.steps=ctx.steps||{};
 const secrets=await db.secret.findMany({where:{teamId:ex.workflow.teamId}});ctx.env=Object.fromEntries(secrets.map(s=>[s.key,decrypt(s.encryptedValue)]));
 let current=ex.currentNodeId?nodes.find(n=>n.id===ex.currentNodeId):(nodes.find(n=>n.type==='trigger')||nodes[0]);
 await db.execution.update({where:{id},data:{status:'RUNNING',startedAt:ex.startedAt||new Date(),resumeAt:null,context:{...ctx,env:{}}}});
 try{
  let guard=0;
  while(current){if(++guard>Math.max(nodes.length*3,20))throw new Error('Cycle or excessive traversal detected');
   const fresh=await db.execution.findUnique({where:{id},select:{status:true}});if(fresh?.status==='PAUSED'){await db.execution.update({where:{id},data:{currentNodeId:current.id,context:{...ctx,env:{}}}});return}
   const type=current.type||'action',rawCfg=current.data?.config||{},cfg=interpolate(rawCfg,ctx),name=current.data?.label||type;const logInput=rawCfg;
   if(type==='approval'){
    const existing=await db.approval.findFirst({where:{executionId:id,nodeId:current.id},orderBy:{createdAt:'desc'}});
    if(!existing){const step=await db.executionStep.create({data:{executionId:id,nodeId:current.id,nodeType:type,name,status:'PAUSED',startedAt:new Date(),input:logInput}});await db.approval.create({data:{executionId:id,nodeId:current.id}});await db.execution.update({where:{id},data:{status:'PAUSED',currentNodeId:current.id,context:{...ctx,env:{}}}});return}
    if(existing.status==='PENDING'){await db.execution.update({where:{id},data:{status:'PAUSED',currentNodeId:current.id,context:{...ctx,env:{}}}});return}
    if(existing.status==='REJECTED')throw new Error('Approval rejected');
    const paused=await db.executionStep.findFirst({where:{executionId:id,nodeId:current.id,status:'PAUSED'},orderBy:{startedAt:'desc'}});if(paused)await db.executionStep.update({where:{id:paused.id},data:{status:'SUCCEEDED',output:{approved:true},finishedAt:new Date(),durationMs:Date.now()-(paused.startedAt?.getTime()||Date.now())}});ctx.steps[current.id]={approved:true};
   } else if(type==='delay'){
    const ms=Math.max(0,Number(cfg.ms||1000));const paused=await db.executionStep.findFirst({where:{executionId:id,nodeId:current.id,status:'PAUSED'},orderBy:{startedAt:'desc'}});
    if(paused){await db.executionStep.update({where:{id:paused.id},data:{status:'SUCCEEDED',output:{delayedMs:ms},finishedAt:new Date(),durationMs:Date.now()-(paused.startedAt?.getTime()||Date.now())}});ctx.steps[current.id]={delayedMs:ms}}
    else if(ms>1000){const step=await db.executionStep.create({data:{executionId:id,nodeId:current.id,nodeType:type,name,status:'PAUSED',startedAt:new Date(),input:logInput}});await db.execution.update({where:{id},data:{status:'PAUSED',currentNodeId:current.id,resumeAt:new Date(Date.now()+ms),context:{...ctx,env:{}}}});return}
    else {await sleep(ms);ctx.steps[current.id]={delayedMs:ms};await db.executionStep.create({data:{executionId:id,nodeId:current.id,nodeType:type,name,status:'SUCCEEDED',startedAt:new Date(Date.now()-ms),finishedAt:new Date(),durationMs:ms,input:cfg,output:{delayedMs:ms}}})}
   } else {
    const maxAttempts=Math.max(1,Number(current.data?.retries||0)+1);let out:any,last:any;
    for(let attempt=1;attempt<=maxAttempts;attempt++){
     const started=new Date(),step=await db.executionStep.create({data:{executionId:id,nodeId:current.id,nodeType:type,name,status:'RUNNING',attempt,startedAt:started,input:logInput}});
     try{out=await executeNode(type,cfg,ctx,id,current);await db.executionStep.update({where:{id:step.id},data:{status:'SUCCEEDED',output:out,finishedAt:new Date(),durationMs:Date.now()-started.getTime()}});last=null;break}catch(err:any){last=err;await db.executionStep.update({where:{id:step.id},data:{status:'FAILED',error:err.message,finishedAt:new Date(),durationMs:Date.now()-started.getTime()}});if(attempt<maxAttempts)await sleep(Math.min(250*2**(attempt-1),4000))}
    }
    if(last)throw last;ctx.steps[current.id]=out;
   }
   const out=ctx.steps[current.id];const outgoing=edges.filter(e=>e.source===current!.id);const next=type==='condition'?outgoing.find(e=>e.sourceHandle===String(Boolean(out?.result)))||outgoing[0]:outgoing[0];current=nodes.find(n=>n.id===next?.target);await db.execution.update({where:{id},data:{currentNodeId:current?.id||null,context:{...ctx,env:{}}}});
  }
  await db.execution.update({where:{id},data:{status:'SUCCEEDED',finishedAt:new Date(),currentNodeId:null,resumeAt:null,context:{...ctx,env:{}},error:null}})
 }catch(err:any){await db.execution.update({where:{id},data:{status:'FAILED',finishedAt:new Date(),error:err.message,context:{...ctx,env:{}}}});const members=await db.membership.findMany({where:{teamId:ex.workflow.teamId,role:{in:['OWNER','ADMIN']}},select:{userId:true}});if(members.length)await db.notification.createMany({data:members.map(m=>({userId:m.userId,title:`Workflow failed: ${ex.workflow.name}`,body:err.message}))});throw err}
}
