'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NodeData } from '../lib/types';
import { initGraph } from '../lib/graphInit/initGraph';
import { useGraphZoom } from '../lib/interaction/graphZoom';
import ZoomControls from './zoomButtons';

interface IccComponent {
  cluster_id: string;
  nodes: string[];
  size: number;
}

export default function GraphCanvas({
  data,
  onSelectNode,
  icc_components,
  highlightNodes,
}: {
  data: any;
  onSelectNode: (node: NodeData) => void;
  icc_components: IccComponent[];
  highlightNodes?: string[];
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const zoomRef = useRef<
    d3.ZoomBehavior<SVGSVGElement, unknown> | null
  >(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const cleanup = initGraph({
      svg: d3.select<SVGSVGElement, unknown>(svgRef.current!),
      container: containerRef.current,
      data,
      icc_components,
      onSelectNode,
      zoomRef,
    });

    
    return () => {
      cleanup?.();
    };
  }, [data, onSelectNode, icc_components]);

  const { zoomIn, zoomOut, zoomFit, zoomToNodes } =
    useGraphZoom(svgRef, zoomRef, containerRef);

  useEffect(() => {
    if (!svgRef.current) return;

    const highlighted = Array.isArray(highlightNodes)
      ? new Set(highlightNodes.map((id) => id.toLowerCase()))
      : new Set<string>();

    const svg = d3.select(svgRef.current);
    const highlightedPositions: { x: number; y: number }[] = [];

    svg.selectAll<SVGGElement, any>('g.node').each(function (d) {
      const id = String(d.id ?? '').toLowerCase();
      const isHighlighted = highlighted.has(id);

      d3.select(this)
        .select<SVGCircleElement>('.main-circle')
        .transition()
        .duration(150)
        .attr('fill', isHighlighted ? '#ea1212' : '#000');

      if (isHighlighted) {
        highlightedPositions.push({ x: d.x ?? 0, y: d.y ?? 0 });
      }
    });

    if (highlightedPositions.length > 0) {
      zoomToNodes(highlightedPositions);
    } else if (highlightNodes?.length === 0) {
      // reset to default view if there are no highlights
      zoomFit();
    }
  }, [highlightNodes, zoomFit, zoomToNodes]);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />

      <ZoomControls
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomFit={zoomFit}
      />
    </div>
  );
}