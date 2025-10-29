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
  BackgroundVariant,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, MessageSquare, Settings } from "lucide-react";

// Function to calculate optimal node positions for better flow visualization
function calculateNodePositions(nodes: any[], edges: any[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const nodeWidth = 250;
  const nodeHeight = 120;
  const horizontalSpacing = 300;
  const verticalSpacing = 200;
  
  // Create a graph structure to understand node relationships
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  // Initialize graph and in-degree count
  nodes.forEach(node => {
    graph[node.id] = [];
    inDegree[node.id] = 0;
  });
  
  // Build graph from edges
  edges.forEach(edge => {
    if (edge.from !== edge.to) { // Don't count loops for layout
      graph[edge.from].push(edge.to);
      inDegree[edge.to]++;
    }
  });
  
  // Find root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(node => inDegree[node.id] === 0);
  
  // If no clear root, use the first node
  const startNodes = rootNodes.length > 0 ? rootNodes : [nodes[0]];
  
  // Position nodes using a layered approach
  const layers: string[][] = [];
  const visited = new Set<string>();
  
  // BFS to create layers
  let currentLayer = startNodes.map(node => node.id);
  while (currentLayer.length > 0) {
    layers.push([...currentLayer]);
    const nextLayer: string[] = [];
    
    currentLayer.forEach(nodeId => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        graph[nodeId].forEach(childId => {
          if (!visited.has(childId) && !nextLayer.includes(childId)) {
            nextLayer.push(childId);
          }
        });
      }
    });
    
    currentLayer = nextLayer;
  }
  
  // Position nodes in layers
  layers.forEach((layer, layerIndex) => {
    layer.forEach((nodeId, nodeIndex) => {
      const x = nodeIndex * horizontalSpacing + (layer.length > 1 ? 50 : 0);
      const y = layerIndex * verticalSpacing + 50;
      
      positions[nodeId] = { x, y };
    });
  });
  
  // Handle any remaining unpositioned nodes
  nodes.forEach(node => {
    if (!positions[node.id]) {
      positions[node.id] = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      };
    }
  });
  
  return positions;
}

interface PathwayViewerProps {
  pathwayData: any;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const nodeTypes = {
  prompt: ({ data }: { data: any }) => (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 min-w-[220px] max-w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-blue-500 rounded-full">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <div className="font-bold text-sm text-blue-800">{data.title}</div>
      </div>
      <div className="text-xs text-blue-700 leading-relaxed">{data.prompt}</div>
      <div className="mt-2 text-xs text-blue-500 font-medium">CONVERSATION</div>
    </div>
  ),
  action: ({ data }: { data: any }) => (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 min-w-[220px] max-w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-green-500 rounded-full">
          <Settings className="h-4 w-4 text-white" />
        </div>
        <div className="font-bold text-sm text-green-800">{data.title}</div>
      </div>
      <div className="text-xs text-green-700 leading-relaxed">{data.prompt}</div>
      <div className="mt-2 text-xs text-green-500 font-medium">SYSTEM ACTION</div>
    </div>
  ),
};

export function PathwayViewer({ pathwayData, onRegenerate, isRegenerating }: PathwayViewerProps) {
  const initialNodes: Node[] = useMemo(() => {
    // Create a better layout for nodes based on their relationships
    const nodePositions = calculateNodePositions(pathwayData.nodes, pathwayData.edges);
    
    return pathwayData.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: nodePositions[node.id] || { x: 0, y: 0 },
      data: node,
    }));
  }, [pathwayData.nodes, pathwayData.edges]);

  const initialEdges: Edge[] = useMemo(() => {
    return pathwayData.edges.map((edge: any) => {
      const isLoop = edge.from === edge.to;
      const isRetry = edge.condition?.includes('failed') || edge.condition?.includes('insufficient');
      const isEscalation = edge.condition?.includes('angry') || edge.condition?.includes('escalation');
      
      return {
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        label: edge.condition,
        type: "smoothstep",
        animated: !isLoop && !isRetry, // Don't animate loops and retries
        style: isLoop ? { 
          stroke: '#ff6b6b', 
          strokeWidth: 3,
          strokeDasharray: '8,4'
        } : isRetry ? {
          stroke: '#f59e0b',
          strokeWidth: 2,
          strokeDasharray: '4,2'
        } : isEscalation ? {
          stroke: '#dc2626',
          strokeWidth: 3
        } : {
          stroke: '#4f46e5',
          strokeWidth: 2
        },
        markerEnd: {
          type: 'arrowclosed',
          color: isLoop ? '#ff6b6b' : isRetry ? '#f59e0b' : isEscalation ? '#dc2626' : '#4f46e5',
          width: 20,
          height: 20
        },
        labelStyle: {
          fontSize: '12px',
          fontWeight: 500,
          fill: isLoop ? '#ff6b6b' : isRetry ? '#f59e0b' : isEscalation ? '#dc2626' : '#4f46e5'
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.8,
          stroke: isLoop ? '#ff6b6b' : isRetry ? '#f59e0b' : isEscalation ? '#dc2626' : '#4f46e5',
          strokeWidth: 1,
          rx: 4,
          ry: 4
        }
      };
    });
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
              className="text-white"
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
          <div className="grid grid-cols-4 gap-4">
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
                {pathwayData.edges.filter((e: any) => e.from === e.to).length}
              </div>
              <div className="text-sm text-gray-600">Loops</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {new Date(pathwayData.meta.generated_at).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">Generated</div>
            </div>
          </div>

          {/* React Flow Diagram */}
          <div className="h-[500px] border rounded-lg bg-gray-50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{
                padding: 0.2,
                includeHiddenNodes: false,
                minZoom: 0.1,
                maxZoom: 2
              }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              minZoom={0.1}
              maxZoom={2}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
            >
              <Controls 
                position="top-right"
                showInteractive={false}
              />
              <MiniMap 
                position="bottom-left"
                nodeColor={(node) => {
                  if (node.type === 'prompt') return '#3b82f6';
                  if (node.type === 'action') return '#10b981';
                  return '#6b7280';
                }}
                nodeStrokeWidth={3}
                nodeBorderRadius={8}
                maskColor="rgba(0, 0, 0, 0.1)"
              />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1.5}
                color="#e5e7eb"
              />
            </ReactFlow>
          </div>

          {/* JSON View Toggle */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
              View Raw JSON
            </summary>
            <pre className="bg-black text-white mt-2 p-4 rounded-lg text-xs overflow-auto">
              {JSON.stringify(pathwayData, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
