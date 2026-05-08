import * as d3 from 'd3';
import { NodeData } from '../types';

type LinkDatum = {
  source: any;
  target: any;
};

type TokenDatum = LinkDatum & {
  t: number;
};

export function startTokenAnimation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: LinkDatum[],
  getNodeColor: (id: string) => string
) {
  const tokens = g.append('g')
    .selectAll<SVGCircleElement, TokenDatum>('circle')
    .data(links as TokenDatum[])
    .join('circle')
    .attr('r', 3)
    .attr('fill', (d) => {
      const srcId =
        typeof d.source === 'object' ? d.source.id : d.source;
      return getNodeColor(srcId);
    })
    .each((d) => {
      d.t = Math.random();
    });

  let rafId: number;

  function animate() {
    tokens.each(function (d) {
      const src = d.source;
      const tgt = d.target;

      if (typeof src !== 'object' || typeof tgt !== 'object') return;
      if (src.x == null || tgt.x == null) return;

      d.t += 0.0012;
      if (d.t > 1) d.t = 0;

      const t = 0.15 + 0.85 * d.t;

      d3.select(this)
        .attr('cx', src.x + (tgt.x - src.x) * t)
        .attr('cy', src.y + (tgt.y - src.y) * t);
    });

    rafId = requestAnimationFrame(animate);
  }

  animate();

  //  很关键：返回 cleanup（取消动画帧）函数，防止内存泄漏
  return () => cancelAnimationFrame(rafId);
}