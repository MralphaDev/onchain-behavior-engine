import { useMemo, useState } from 'react';
type ClusterSupply = {
  cluster_supply_percentage: number;
  node_count: number;
};

interface IccDbscanCluster {
  cluster_id: string;
  labels: Record<string, number>;
  size: number;
  n_clusters: number;
}

interface LeftPanelProps {
  icc_dbscan_clusters?: IccDbscanCluster[];
  funder_backtrack?: Record<string, Record<string, string[]>>;
  onHighlightNodes?: (wallets: string[]) => void;

  icc_supply_stats?: Record<string, ClusterSupply>;
}

interface GroupInfo {
  label: number;
  displayName: string;
  wallets: string[];
}


const shortenAddress = (address: string) => {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

function calculateClusterRisk(
  clusterId: string,
  icc_supply_stats?: Record<string, ClusterSupply>,
  funder_backtrack?: Record<string, Record<string, string[]>>,
  subgroupCount: number = 0
) {
  // -------------------------
  // 1. HOLDING SCORE
  // -------------------------
  const supply = icc_supply_stats?.[clusterId];

  const holdingScore = supply
    ? Math.min(100, supply.cluster_supply_percentage * 100)
    : 0;

  // -------------------------
  // 2. FUNDING SCORE
  // -------------------------
  const backtrack = funder_backtrack?.[clusterId];

  let fundScore = 0;

  if (backtrack) {
    const allRoots = Object.values(backtrack).flat();

    const uniqueRoots = new Set(allRoots);

    const totalSubgroups = Object.keys(backtrack).length;

    const convergenceRatio =
      totalSubgroups > 0
        ? uniqueRoots.size / totalSubgroups
        : 1;

    // lower unique root count = higher coordination
    fundScore = (1 - convergenceRatio) * 100;
  }

  // -------------------------
  // 3. BEHAVIOR SCORE
  // -------------------------
  const normalizedSubgroups = Math.min(subgroupCount, 10);

  const behaviorScore =
    (normalizedSubgroups / 10) * 100;

  // -------------------------
  // 4. BASE WEIGHTED SCORE
  // -------------------------
  const baseScore =
    holdingScore * 0.5 +
    fundScore * 0.3 +
    behaviorScore * 0.2;

  // -------------------------
  // 5. SYNERGY AMPLIFICATION
  // -------------------------
  let multiplier = 1;

  // all 3 dimensions strong
  if (
    holdingScore > 50 &&
    fundScore > 50 &&
    behaviorScore > 50
  ) {
    multiplier += 0.35;
  }

  // 2 strong dimensions
  else if (
    (holdingScore > 50 && fundScore > 50) ||
    (holdingScore > 50 && behaviorScore > 50) ||
    (fundScore > 50 && behaviorScore > 50)
  ) {
    multiplier += 0.18;
  }

  // EXTREME coordinated case
  if (
    holdingScore > 70 &&
    fundScore > 80 &&
    behaviorScore > 70
  ) {
    multiplier += 0.25;
  }

  // -------------------------
  // 6. FINAL
  // -------------------------
  const finalScore = baseScore * multiplier;

  return Math.min(100, Math.round(finalScore));
}

export default function LeftPanel({ icc_dbscan_clusters, funder_backtrack, onHighlightNodes, icc_supply_stats }: LeftPanelProps) {
  const [selectedGroup, setSelectedGroup] = useState<{ clusterId: string; label: number } | null>(null);

  const clusters = Array.isArray(icc_dbscan_clusters) ? icc_dbscan_clusters : [];

  const normalizedClusters = useMemo(
    () =>
      clusters.map((cluster) => {
        const labelValues = Object.values(cluster.labels ?? {});
        const uniqueLabels = Array.from(new Set(labelValues)).sort((a, b) => a - b);
        const synchronizedLabels = uniqueLabels.filter((label) => label >= 0);

        const groups: GroupInfo[] = uniqueLabels.map((label) => ({
          label,
          displayName: label === -1 ? 'noise' : `subgroup ${label}`,
          wallets: Object.entries(cluster.labels ?? {})
            .filter(([, value]) => Number(value) === label)
            .map(([address]) => address),
        }));

        return {
          ...cluster,
          uniqueLabels,
          synchronizedLabels,
          groups,
          summary:
            synchronizedLabels.length > 0
              ? `${synchronizedLabels.length} highly synchronized subgroup${
                  synchronizedLabels.length === 1 ? '' : 's'
                } detected within ${cluster.cluster_id}`
              : 'No synchronized behavior detected',
        };
      }),
    [clusters]
  );

  const selectedCluster = selectedGroup
    ? normalizedClusters.find((cluster) => cluster.cluster_id === selectedGroup.clusterId)
    : null;

  const selectedGroupInfo = selectedCluster?.groups.find(
    (group) => group.label === selectedGroup?.label
  );

  return (
    <aside className="h-[57vh] w-80 min-w-[320px] border-r border-white/10 bg-slate-950/90 backdrop-blur-xl text-white flex flex-col overflow-hidden">
      <div className="px-6 py-6">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
          Cluster View
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          DBSCAN groups
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Scroll through detected ICC clusters and observe subgroup alignment.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {!selectedGroupInfo ? (
          <div className="space-y-5">
            {normalizedClusters.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                No DBSCAN cluster data available.
              </div>
            ) : (
              normalizedClusters.map((cluster) => {
                
              const backtrack = funder_backtrack?.[cluster.cluster_id];
              const riskScore = calculateClusterRisk(
                cluster.cluster_id,
                icc_supply_stats,
                funder_backtrack,
                cluster.uniqueLabels.length
              );


                return (
                  <div
                    key={cluster.cluster_id}
                    className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-[0_40px_120px_-90px_rgba(14,165,233,0.45)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          Cluster
                        </div>
                        <div className="mt-2 text-base font-semibold text-white">
                          {cluster.cluster_id}
                        </div>
                      </div>

                      <div className="rounded-3xl bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                        {cluster.size} nodes
                      </div>
                    </div>

                    {/* SUBGROUP BUTTONS */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cluster.uniqueLabels.length > 0 ? (
                        cluster.uniqueLabels.map((label) => {
                          const wallets =
                            cluster.groups.find((group) => group.label === label)?.wallets ?? [];

                          return (
                            <button
                              key={`${cluster.cluster_id}-${label}`}
                              type="button"
                              onClick={() => {
                                setSelectedGroup({ clusterId: cluster.cluster_id, label });
                                if (typeof onHighlightNodes === 'function') {
                                  onHighlightNodes(wallets);
                                }
                              }}
                              className={`inline-flex items-center rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
                                label === -1
                                  ? 'bg-white/5 text-slate-400 border border-white/10'
                                  : 'bg-cyan-500/10 text-cyan-200 border border-cyan-400/10'
                              } hover:scale-[1.02] hover:-translate-y-0.5`}
                            >
                              {label === -1 ? 'noise' : `subgroup ${label}`}
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-3xl bg-white/5 px-3 py-2 text-xs text-slate-400">
                          no subgroup labels found
                        </div>
                      )}
                    </div>

                    {/* SUMMARY */}
                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                      {cluster.summary}
                    </div>

                    {/*  RISK SCORE (NEW — NO LAYOUT CHANGE IMPACT) */}
                    <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 uppercase tracking-widest text-xs">
                          Risk Score
                        </span>

                        <span
                          className={`font-semibold ${
                            riskScore > 70
                              ? 'text-red-300'
                              : riskScore > 40
                              ? 'text-yellow-300'
                              : 'text-green-300'
                          }`}
                        >
                          {riskScore}/100
                        </span>
                      </div>
                    </div>

                    {/* BACKTRACK */}
                    {(() => {
                      if (!backtrack || Object.keys(backtrack).length === 0) return null;

                      const allRoots = Object.values(backtrack).flat();
                      const uniqueRoots = Array.from(new Set(allRoots));

                      return (
                        <div className="mt-4 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                          <div className="flex items-center gap-2 font-semibold uppercase tracking-widest text-amber-300">
                            ⚠️ Shared Funder Backtrack
                          </div>

                          <div className="mt-3 space-y-2">
                            {Object.entries(backtrack).map(([subg, roots]) => (
                              <div key={subg} className="text-slate-200">
                                <span className="text-amber-300 font-medium">{subg}</span>
                                <span className="mx-2 text-slate-500">→</span>

                                {roots.length > 0 ? (
                                  roots.map((r, i) => (
                                    <span key={i} className="text-cyan-300 font-mono">
                                      {shortenAddress(r)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-500">no root found</span>
                                )}
                              </div>
                            ))}
                          </div>

                          {uniqueRoots.length === 1 && (
                            <div className="mt-3 text-xs text-amber-200/80">
                              ✔ All subgroups converge to a single funder root
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => {
                setSelectedGroup(null);
                if (typeof onHighlightNodes === 'function') {
                  onHighlightNodes([]);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              ← Back
            </button>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-[0_40px_120px_-90px_rgba(14,165,233,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {selectedGroupInfo?.displayName}
                  </div>
                  <div className="mt-2 text-base font-semibold text-white">
                    {selectedCluster?.cluster_id}
                  </div>
                </div>
                <div className="rounded-3xl bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  {selectedGroupInfo?.wallets.length} wallets
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 overflow-y-auto max-h-[28rem]">
              <div className="grid gap-3">
                {selectedGroupInfo?.wallets.map((wallet) => (
                  <div
                    key={wallet}
                    className="rounded-3xl border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-slate-200"
                  >
                    {shortenAddress(wallet)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
