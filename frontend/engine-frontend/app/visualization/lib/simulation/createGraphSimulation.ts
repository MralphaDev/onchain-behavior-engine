import * as d3 from 'd3';
import { NodeData } from '../types';

export function createSimulation(
  nodes: NodeData[],
  links: any[],
  width: number,
  height: number,
  nodeR: number
) {
  return d3.forceSimulation<NodeData>(nodes)
    .force('charge', d3.forceManyBody().strength(-120))
    .force('collision', d3.forceCollide().radius(nodeR).strength(0.7))
    .force(
      'link',
      d3.forceLink<NodeData, any>(links)
        .id((d) => d.id)
        .distance(140)
        .strength(0.4)
    )
    .force('center', d3.forceCenter(width / 2, height / 2));
}