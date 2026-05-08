import { NodeData } from '../lib/types';

export default function NodePanel({
  node,
  clusterNodes,
  supplyStats,
}: {
  node: NodeData | null;
  clusterNodes: NodeData[];
  supplyStats: Record<string, any>;
}) {
  if (!node) {
    return (
      <div className="w-96 border-l border-white/10 text-white p-6">
        <div className="text-sm text-gray-400">
          Select a node to view intelligence
        </div>
      </div>
    );
  }


  const clusterKey = node.cluster ?? null;

  const stats =
    clusterKey && supplyStats
      ? supplyStats[clusterKey]
      : null;

  const supplyPct = stats?.cluster_supply_percentage ?? 0;

const isHighConcentration = supplyPct >= 0.2; // tweak threshold (20%)
const isExtreme = supplyPct >= 0.5; // optional stronger flag

  const formatPct = (v?: number) =>
    typeof v === 'number' ? `${(v * 100).toFixed(4)}%` : 'N/A';

  return (
    <div className="w-96 border-l border-white/10 text-white p-5 space-y-5 overflow-auto">

      {/* ========================= */}
      {/* IDENTITY */}
      {/* ========================= */}
      <div className="space-y-1">
        <div className="text-xs text-gray-500 uppercase">
          Node
        </div>

        <div className="font-mono text-[11px] break-all text-white/80">
          {node.id}
        </div>

        <div className="text-xs text-gray-400">
          Funded by: {node.direct_funder ?? 'N/A'}
        </div>
      </div>

      {/* ========================= */}
      {/* CLUSTER */}
      {/* ========================= */}
      <div className="bg-white/5 p-4 rounded-lg space-y-2">
        <div className="text-xs text-gray-400 uppercase">
          Cluster
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">ID</span>
          <span>{clusterKey ?? 'Unassigned'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Size</span>
          <span>{stats?.node_count ?? 'Isolated'}</span>
        </div>
      </div>

      {/* ========================= */}
      {/* SUPPLY */}
      {/* ========================= */}
      <div className="bg-white/5 p-4 rounded-lg space-y-2 border border-white/10">
        <div className="text-xs text-gray-400 uppercase">
          ICC Supply Exposure
        </div>

        {stats ? (
          <>
            {/* Supply % */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Share</span>

              <span
                className={`font-semibold ${
                  isExtreme
                    ? 'text-red-500'
                    : isHighConcentration
                    ? 'text-orange-400'
                    : 'text-green-400'
                }`}
              >
                {formatPct(supplyPct)}
              </span>
            </div>

            {/* Node count */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Node Count</span>
              <span>{stats.node_count}</span>
            </div>

            {/* ⚠️ WARNING */}
            {isHighConcentration && (
              <div
                className={`mt-2 text-xs font-semibold px-2 py-1 rounded
                ${
                  isExtreme
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }`}
              >
                ⚠ Highly concentrated supply in this cluster
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-red-400">
            No stats for this cluster
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* BEHAVIOR */}
      {/* ========================= */}
      <div className="bg-white/5 p-4 rounded-lg space-y-2">
        <div className="text-xs text-gray-400 uppercase">
          Behavior
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">TX</span>
          <span>{node.behavior_vector?.total_tx ?? 'N/A'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">First Fund</span>
          <span>{node.behavior_vector?.first_fund_amount ?? 'N/A'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Timestamp</span>
          <span>{node.behavior_vector?.first_fund_timestamp ?? 'N/A'}</span>
        </div>
      </div>

      {/* ========================= */}
      {/* SUPPLY POSITION */}
      {/* ========================= */}
      <div className="bg-white/5 p-4 rounded-lg space-y-2">
        <div className="text-xs text-gray-400 uppercase">
          Flow
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Net</span>
          <span>{node.supply_holding?.net_non_native_flow ?? 'N/A'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">In</span>
          <span>{node.supply_holding?.in_amount ?? 'N/A'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Out</span>
          <span>{node.supply_holding?.out_amount ?? 'N/A'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Hold %</span>
          <span className="text-blue-300 font-semibold">
            {formatPct(node.supply_holding?.holding_percentage)}
          </span>
        </div>
      </div>

      {/* ========================= */}
      {/* ACTIONS (FIXED TYPING) */}
      {/* ========================= */}
      <div className="bg-white/5 p-4 rounded-lg space-y-2">
        <div className="text-xs text-gray-400 uppercase">
          Actions
        </div>

        <div className="max-h-40 overflow-auto space-y-1">
          {node.action_sequence?.length ? (
            node.action_sequence.map((a: string, i: number) => (
              <div
                key={i}
                className="text-[11px] font-mono text-white/70"
              >
                {i + 1}. {a}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              No actions
            </div>
          )}
        </div>
      </div>

    </div>
  );
}