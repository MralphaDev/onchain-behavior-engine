import { useCallback } from 'react';
import * as d3 from 'd3';

export function useGraphZoom(
    svgRef: React.RefObject<SVGSVGElement | null>,
    zoomRef: React.RefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | null>,
    containerRef: React.RefObject<HTMLDivElement | null>
) {
  const zoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;

    d3.select(svgRef.current)
      .transition()
      .call(zoomRef.current.scaleBy, 1.35);
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;

    d3.select(svgRef.current)
      .transition()
      .call(zoomRef.current.scaleBy, 0.75);
  }, []);

  const zoomFit = useCallback(() => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current) return;

    const { clientWidth: W, clientHeight: H } = containerRef.current;

    d3.select(svgRef.current)
      .transition()
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
          .translate(W / 2, H / 2)
          .scale(0.85)
      );
  }, [svgRef, zoomRef, containerRef]);

  const zoomToNodes = useCallback(
    (nodes: Array<{ x: number; y: number }>) => {
      if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
      if (!nodes.length) return;

      const { clientWidth: W, clientHeight: H } = containerRef.current;
      const xs = nodes.map((d) => d.x);
      const ys = nodes.map((d) => d.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const width = Math.max(maxX - minX, 1);
      const height = Math.max(maxY - minY, 1);
      const padding = 120;
      const scale = Math.min(
        5,
        Math.max(0.15, Math.min((W - padding) / width, (H - padding) / height))
      );
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const tx = W / 2 - centerX * scale;
      const ty = H / 2 - centerY * scale;

      d3.select(svgRef.current)
        .transition()
        .duration(700)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    },
    [svgRef, zoomRef, containerRef]
  );

  return { zoomIn, zoomOut, zoomFit, zoomToNodes };
}