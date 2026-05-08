import * as d3 from 'd3';
import { NodeData } from '../types';
import { createNodes, createLinks } from '../helpers/buildGraph';
import { createSimulation } from '../simulation/createGraphSimulation';
import { buildDefs} from '../visuals/svgDefs';
import { createColorSystem } from '../visuals/colors';
import { createNodeLayer } from '../visuals/nodeRenderer';
import { attachNodeInteraction } from '../interaction/nodeInteraction';
import { attachSimulationEffects } from '../simulation/graphSimulationEffects';
import { startTokenAnimation } from '../visuals/graphTokenAnimation';

export function initGraph({
  svg,
  container,
  data,
  icc_components,
  onSelectNode,
  zoomRef,
}: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  container: HTMLDivElement;
  data: any;
  icc_components: {
    cluster_id: string;
    nodes: string[];
    size: number;
  }[];
  onSelectNode: (node: NodeData) => void;
  zoomRef: React.RefObject<
  d3.ZoomBehavior<SVGSVGElement, unknown> | null
    >;
}): (() => void) | undefined {
  const nodes = createNodes(data);
  if (!nodes.length) return;

  // dimensions
  const W = container.clientWidth;
  const H = container.clientHeight;
 
  // color system
  const colorSystem = createColorSystem(nodes, icc_components);
  const links = createLinks(data);

  svg.selectAll('*').remove();

  const defs = svg.append('defs');
  buildDefs(defs, colorSystem.uniqueColors);

  const g = svg.append('g');

  
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.15, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  zoomRef.current = zoom;


    // ── link layer ─────────────────────────────────────────────────────────
const link = g.append('g')
  .attr('class', 'links')
  .selectAll<SVGLineElement, typeof links[0]>('line')
  .data(links)
  .enter()
  .append('line')
  .attr('stroke', 'rgba(255, 255, 255, 0.25)')
  .attr('stroke-width', 1)
  .attr('stroke-linecap', 'round')
  .attr('marker-end', 'url(#arrow)')

  

    const nodeGroup = createNodeLayer(
      g,
      nodes,
      colorSystem.getColor,
      colorSystem.getColorIndex,
      21
    );

  const simulation = createSimulation(nodes, links, W, H, 21);

  attachSimulationEffects(
    simulation,
    nodeGroup,
    link,
    links,
    W,
    H,
    21,
    23
  );

  attachNodeInteraction(
    nodeGroup,
    link,
    svg,
    zoom,
    simulation,
    colorSystem.getColor,
    onSelectNode,
    W,
    H,
    21
  );

  startTokenAnimation(g, links, colorSystem.getColor);

  // CLEANUP (must return void)
  return () => {
    simulation.stop();
  };
}