"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, MessageSquare, Settings } from "lucide-react";

interface PathwayViewerProps {
  pathwayData: any;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const nodeTypes = {
  prompt: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-blue-600" />
        <div className="font-bold text-sm">{data.title}</div>
      </div>
      <div className="text-xs text-gray-600">{data.prompt}</div>
    </div>
  ),
  action: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-400 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="h-4 w-4 text-green-600" />
        <div className="font-bold text-sm">{data.title}</div>
      </div>
      <div className="text-xs text-gray-600">{data.prompt}</div>
    </div>
  ),
};

export function PathwayViewer({ pathwayData, onRegenerate, isRegenerating }: PathwayViewerProps) {
  const initialNodes: Node[] = useMemo(() => {
    return pathwayData.nodes.map((node: any, index: number) => ({
      id: node.id,
      type: node.type,
      position: { x: index * 250, y: 100 },
      data: node,
    }));
  }, [pathwayData.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
    return pathwayData.edges.map((edge: any) => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: edge.condition,
      type: "smoothstep",
      animated: true,
    }));
  }, [pathwayData.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Generated Pathway: {pathwayData.pathway_name}
            </CardTitle>
            <CardDescription>
              Interactive pathway visualization
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getConfidenceColor(pathwayData.meta.confidence)}>
              Confidence: {(pathwayData.meta.confidence * 100).toFixed(0)}%
            </Badge>
            <Button
              onClick={onRegenerate}
              disabled={isRegenerating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{pathwayData.nodes.length}</div>
              <div className="text-sm text-gray-600">Nodes</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{pathwayData.edges.length}</div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {new Date(pathwayData.meta.generated_at).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">Generated</div>
            </div>
          </div>

          {/* React Flow Diagram */}
          <div className="h-[400px] border rounded-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>

          {/* JSON View Toggle */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
              View Raw JSON
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
              {JSON.stringify(pathwayData, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
