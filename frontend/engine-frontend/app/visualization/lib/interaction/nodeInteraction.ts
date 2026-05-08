import * as d3 from 'd3';
import { NodeData } from '../types';

export function attachNodeInteraction(
  nodeGroup: d3.Selection<SVGGElement, NodeData, any, any>,
  link: d3.Selection<SVGLineElement, any, any, any>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
  simulation: d3.Simulation<NodeData, undefined>,
  getNodeColor: (id: string) => string,
  onSelectNode: (node: NodeData) => void,
  W: number,
  H: number,
  NODE_R: number
) {
  let selectedId: string | null = null;

// ── hover ──────────────────────────────────────────────────────────────
    nodeGroup
      .on('mouseenter', function (_, d) {
        if ((d as any).id === selectedId) return;
        d3.select(this).select('.ring')
          .attr('stroke-opacity', 0.5)
          .transition().duration(150).attr('r', NODE_R + 7);
        d3.select(this).select('.main-circle')
          .transition().duration(150).attr('r', NODE_R + 1);
        d3.select(this).select('.overlay-circle')
          .transition().duration(150).attr('r', NODE_R + 1);
      })
      .on('mouseleave', function (_, d) {
        if ((d as any).id !== selectedId) {
          d3.select(this).select('.ring')
            .transition().duration(200).attr('stroke-opacity', 0).attr('r', NODE_R + 5);
          d3.select(this).select('.main-circle')
            .transition().duration(200).attr('r', NODE_R);
          d3.select(this).select('.overlay-circle')
            .transition().duration(200).attr('r', NODE_R);
        }
      })
      // ── select + zoom + ripple (file 1) ──────────────────────────────
      .on('click', function (_, d) {
        if (selectedId) {
          nodeGroup.each(function (nd) {
            if ((nd as any).id === selectedId) {
              d3.select(this).select('.ring')
                .attr('stroke-opacity', 0).attr('r', NODE_R + 5).attr('stroke-width', 1.5);
              d3.select(this).select('.main-circle').attr('r', NODE_R);
              d3.select(this).select('.overlay-circle').attr('r', NODE_R);
            }
          });
        }

        selectedId = (d as any).id;
        const color = getNodeColor(selectedId!);

        d3.select(this).select('.ring')
          .attr('stroke-opacity', 0.9).attr('r', NODE_R + 9).attr('stroke-width', 2.5);
        d3.select(this).select('.main-circle').attr('r', NODE_R + 2);
        d3.select(this).select('.overlay-circle').attr('r', NODE_R + 2);

        link
          .attr('stroke', (l: any) =>
            l.source.id === selectedId || l.target.id === selectedId
              ? 'rgba(120,180,255,0.75)'
              : 'rgba(255, 255, 255, 0.25)')
          .attr('stroke-width', (l: any) =>
            l.source.id === selectedId || l.target.id === selectedId ? 2.5 : 1);

        const scale = 2;
        const tx = W / 2 - (d.x ?? 0) * scale;
        const ty = H / 2 - (d.y ?? 0) * scale;

        svg.transition().duration(600)
          .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
          .on('end', () => {
            const transform = d3.zoomTransform(svg.node()!);
            const rx = transform.applyX(d.x ?? 0);
            const ry = transform.applyY(d.y ?? 0);
            for (let i = 0; i < 3; i++) {
              svg.append('circle')
                .attr('cx', rx).attr('cy', ry).attr('r', 0)
                .attr('stroke', color).attr('stroke-width', 3)
                .attr('fill', 'none').attr('opacity', 0.5)
                .transition().delay(i * 150).duration(1000)
                .attr('r', 120).attr('opacity', 0).remove();
            }
          });

        const { x, y, fx, fy, vx, vy, index, ...cleanNode } = d as any;
        onSelectNode(cleanNode);
      });

    // ── drag ───────────────────────────────────────────────────────────────
    nodeGroup.call(
      d3.drag<SVGGElement, NodeData>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.1).restart(); //this line controls how much the simulation "heats up" when dragging starts. Higher = more movement,disable this will make the graph more static during drag
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );
}