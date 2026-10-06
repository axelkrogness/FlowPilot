import './globals.css'; import Link from 'next/link';
export const metadata={title:'FlowPilot — Visual AI Workflow Builder',description:'Build, publish and execute reliable AI automations.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><div className="shell"><nav className="nav"><Link href="/dashboard" className="brand"><span className="logo">F↗</span><span>FlowPilot</span></Link><div className="muted">Visual AI Workflow Builder · <b>Powered by Codyza</b></div></nav>{children}</div></body></html>}
