'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
} from '@xyflow/react';
import { useRouter } from 'next/navigation';
import ScheduleControl from './ScheduleControl';

const kinds = [
  'http',
  'ai',
  'condition',
  'delay',
  'approval',
  'database',
];

function Box({ data, type }: { data: any; type: string }) {
  return (
    <div
      style={{
        background: '#10233a',
        border: '1px solid #34506f',
        borderRadius: 12,
        padding: 12,
        minWidth: 150,
      }}
    >
      <Handle type="target" position={Position.Left} />

      <b>{data.label || type}</b>

      <div
        style={{
          fontSize: 11,
          color: '#8ea5c2',
          marginTop: 5,
        }}
      >
        {type}
      </div>

      {type === 'condition' ? (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ top: '35%' }}
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{ top: '70%' }}
          />
        </>
      ) : (
        <Handle type="source" position={Position.Right} />
      )}
    </div>
  );
}

const nodeTypes = Object.fromEntries(
  ['trigger', ...kinds].map((kind) => [
    kind,
    (props: any) => <Box {...props} type={kind} />,
  ])
);

export default function Editor({ workflow }: { workflow: any }) {
  const router = useRouter();

  const graph = workflow.draftGraph || {
    nodes: [],
    edges: [],
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [configText, setConfigText] = useState('{}');
  const [configError, setConfigError] = useState('');
  const [saving, setSaving] = useState(false);

  const selected = nodes.find((node) => node.id === selectedId) || null;

  useEffect(() => {
    if (selected) {
      setConfigText(
        JSON.stringify(selected.data?.config || {}, null, 2)
      );
      setConfigError('');
    }
  }, [selectedId]);

  const onConnect = useCallback(
    (connection: any) => {
      setEdges((currentEdges) =>
        addEdge(connection, currentEdges)
      );
    },
    [setEdges]
  );

  function add(type: string) {
    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id: crypto.randomUUID(),
        type,
        position: {
          x: 100 + currentNodes.length * 35,
          y: 100 + currentNodes.length * 25,
        },
        data: {
          label:
            type === 'trigger'
              ? 'Manual trigger'
              : type[0].toUpperCase() + type.slice(1),

          config:
            type === 'http'
              ? {
                  url: 'https://httpbin.org/get',
                  method: 'GET',
                }
              : type === 'condition'
                ? {
                    path: 'input.approved',
                    operator: 'equals',
                    value: 'true',
                  }
                : type === 'delay'
                  ? {
                      ms: 1000,
                    }
                  : type === 'ai'
                    ? {
                        prompt: 'Summarize: {{input.text}}',
                      }
                    : {},
        },
      },
    ]);
  }

  function updateSelectedData(patch: Record<string, any>) {
    if (!selectedId) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedId
          ? {
              ...node,
              data: {
                ...node.data,
                ...patch,
              },
            }
          : node
      )
    );
  }

  function changeConfig(value: string) {
    setConfigText(value);

    try {
      const config = JSON.parse(value);

      updateSelectedData({
        config,
      });

      setConfigError('');
    } catch {
      setConfigError('JSON is not valid yet.');
    }
  }

  async function save() {
    if (configError) {
      alert('Fix the Config JSON before saving.');
      return false;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/workflows/${workflow.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draftGraph: {
              nodes,
              edges,
            },
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        alert(result.error || 'Workflow could not be saved.');
        return false;
      }

      return true;
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    const saved = await save();

    if (!saved) return;

    const response = await fetch(
      `/api/workflows/${workflow.id}/publish`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      alert(result.error || 'Workflow could not be published.');
      return;
    }

    router.refresh();
  }

  async function execute() {
    const saved = await save();

    if (!saved) return;

    const response = await fetch(
      `/api/workflows/${workflow.id}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            text: 'Hello from FlowPilot',
            approved: true,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Workflow execution failed.');
      return;
    }

    router.push(`/executions/${result.id}`);
  }

  return (
    <div className="canvas">
      <aside className="sidebar">
        <h3>Nodes</h3>

        <button
          className="nodebtn"
          onClick={() => add('trigger')}
        >
          ▶ Manual trigger
        </button>

        {kinds.map((kind) => (
          <button
            className="nodebtn"
            key={kind}
            onClick={() => add(kind)}
          >
            + {kind}
          </button>
        ))}

        <hr style={{ borderColor: '#21344d' }} />

        <p className="muted">
          Variables use <code>{'{{input.name}}'}</code> or{' '}
          <code>{'{{steps.NODE_ID.body}}'}</code>.
        </p>
      </aside>

      <div className="flow">
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            padding: 12,
          }}
          className="row"
        >
          <button
            className="btn secondary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save draft'}
          </button>

          <button
            className="btn secondary"
            onClick={publish}
            disabled={saving}
          >
            Publish v{workflow.version + 1}
          </button>

          <button
            className="btn"
            onClick={execute}
            disabled={saving}
          >
            Run now
          </button>

          <span className="badge">{workflow.state}</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <aside className="inspector">
        <h3>Inspector</h3>

        {selected ? (
          <>
            <label>Label</label>

            <input
              className="input"
              value={String(selected.data?.label || '')}
              onChange={(event) =>
                updateSelectedData({
                  label: event.target.value,
                })
              }
            />

            <label>Config (JSON)</label>

            <textarea
              className="input"
              rows={12}
              value={configText}
              onChange={(event) =>
                changeConfig(event.target.value)
              }
            />

            {configError && (
              <p
                style={{
                  color: '#fca5a5',
                  fontSize: 12,
                }}
              >
                {configError}
              </p>
            )}

            <label>Retries</label>

            <input
              className="input"
              type="number"
              min="0"
              value={Number(selected.data?.retries || 0)}
              onChange={(event) =>
                updateSelectedData({
                  retries: Number(event.target.value),
                })
              }
            />
          </>
        ) : (
          <p className="muted">
            Select a node to configure it.
          </p>
        )}

        <hr style={{ borderColor: '#21344d' }} />

        <ScheduleControl
          id={workflow.id}
          initial={workflow.scheduleCron}
        />

        <hr style={{ borderColor: '#21344d' }} />

        <p className="muted">Webhook URL</p>

        <code
          style={{
            fontSize: 11,
            wordBreak: 'break-all',
          }}
        >
          {typeof location === 'undefined'
            ? ''
            : location.origin}
          /api/webhooks/{workflow.webhookToken}
        </code>
      </aside>
    </div>
  );
}