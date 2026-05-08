import * as d3 from 'd3';
import { NodeData } from '../types';

export function attachSimulationEffects(
  simulation: d3.Simulation<NodeData, undefined>,
  nodeGroup: d3.Selection<SVGGElement, NodeData, any, any>,
  link: d3.Selection<SVGLineElement, any, any, any>,
  links: any[],
  W: number,
  H: number,
  NODE_R: number,
  ARROW_OFFSET: number
) {
  // ── dashed stroke for isolated nodes ─────────────────────────────
  simulation.on('end', () => {
    const linkedIds = new Set(
      links.flatMap((l: any) => [
        typeof l.source === 'object' ? l.source.id : l.source,
        typeof l.target === 'object' ? l.target.id : l.target,
      ])
    );

    nodeGroup
      .select<SVGCircleElement>('.main-circle')
      .attr('stroke-dasharray', (d) =>
        linkedIds.has(d.id) ? null : '6 5'
      );
  });

  // ── tick ────────────────────────────────────────────────────────
  simulation.on('tick', () => {
    nodeGroup.attr('transform', (d) =>
      `translate(${d.x ?? W / 2}, ${d.y ?? H / 2})`
    );

    link
      .attr('x1', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return d.source.x + (dx / dist) * NODE_R;
      })
      .attr('y1', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return d.source.y + (dy / dist) * NODE_R;
      })
      .attr('x2', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return d.target.x - (dx / dist) * ARROW_OFFSET;
      })
      .attr('y2', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return d.target.y - (dy / dist) * ARROW_OFFSET;
      });
  });
}