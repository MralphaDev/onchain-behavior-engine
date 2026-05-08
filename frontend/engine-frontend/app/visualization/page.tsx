'use client';

import { useEffect, useMemo, useState } from 'react';
import GraphCanvas from './components/GraphCanvas';
import LeftPanel from './components/LeftPanel';
import NodePanel from './components/NodePanel';
import { normalizeNodes } from './lib/helpers/normalizeNodes';
import { NodeData } from './lib/types';

export default function VisualizationPage() {
  const [data, setData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<string[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem('rugpull_result');
    if (!raw) return;
    setData(JSON.parse(raw));
  }, []);

  // -------------------------
  // 1. Build cluster map ONCE
  // -------------------------
  const nodeToCluster = useMemo(() => {
    if (!data?.icc_components) return {};

    const map: Record<string, string> = {};

    data.icc_components.forEach((cluster: any) => {
      cluster.nodes.forEach((addr: string) => {
        map[addr.toLowerCase()] = cluster.cluster_id;
      });
    });

    return map;
  }, [data]);

  // -------------------------
  // 2. Normalize nodes ONCE
  // -------------------------
  const enrichedNodes: NodeData[] = useMemo(() => {
    if (!data?.enriched_nodes) return [];

    return normalizeNodes(data.enriched_nodes).map((n: any) => ({
      ...n,
      cluster: nodeToCluster[n.id?.toLowerCase()] ?? null,
    }));
  }, [data, nodeToCluster]);

  // -------------------------
  // 3. Stable graph object
  // -------------------------
  const graphData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      enriched_nodes: enrichedNodes,
      icc_components: data.icc_components,
    };
  }, [data, enrichedNodes]);

  if (!data || !graphData) {
    return <div className="text-white p-10">Loading graph...</div>;
  }

  return (
    <div className="w-full h-screen grid grid-cols-[minmax(320px,24rem)_minmax(0,1fr)_24rem] bg-black">
       <div className="flex items-center">
        <LeftPanel icc_dbscan_clusters={data?.icc_dbscan_clusters} funder_backtrack={data?.funder_backtrack} onHighlightNodes={setHighlightNodes} icc_supply_stats={data?.icc_supply_stats} />
      </div>

      <GraphCanvas
        data={graphData}
        onSelectNode={setSelectedNode}
        icc_components={data.icc_components}
        highlightNodes={highlightNodes}
      />

      <NodePanel
        node={selectedNode}
        clusterNodes={enrichedNodes}
        supplyStats={data.icc_supply_stats}
      />
    </div>
  );
}