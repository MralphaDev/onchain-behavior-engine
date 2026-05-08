export const BASE_COLORS = [
  '#ef7112', '#da00ab', '#00d58c',
  '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4',
];


export function createColorSystem(nodes: any[], icc_components: any[]) {
  const map = new Map<string, string>();

  // ── build cluster → color map ───────────────────
  if (icc_components?.length) {
    const sorted = [...icc_components].sort((a, b) => b.size - a.size);

    sorted.forEach((cluster, i) => {
      const color = BASE_COLORS[i % BASE_COLORS.length];

      cluster.nodes.forEach((id: string) => {
        map.set(id.toLowerCase(), color);
      });
    });
  }

  // ── color getter ────────────────────────────────
  const getColor = (id: string) =>
    map.get(id.toLowerCase()) ?? '#64748b';

  // ── unique colors (for defs) ────────────────────
  const uniqueColors = Array.from(
    new Set(nodes.map((n) => getColor(n.id)))
  );

  // ── fast index lookup (avoid indexOf) ───────────
  const colorIndexMap = new Map<string, number>();
  uniqueColors.forEach((c, i) => colorIndexMap.set(c, i));

  const getColorIndex = (id: string) => {
    const color = getColor(id);
    return colorIndexMap.get(color) ?? uniqueColors.length - 1;
  };

  return {
    getColor,
    getColorIndex,
    uniqueColors,
  };
}