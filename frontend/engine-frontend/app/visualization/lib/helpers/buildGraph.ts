import { NodeData } from '../types';
import { normalizeNodes } from './normalizeNodes';

export function createNodes(data: any): NodeData[] {
  return normalizeNodes(data.enriched_nodes);
}

export function createLinks(data: any) {
  const links: { source: string; target: string }[] = [];

  if (data.graph?.adj) {
    Object.entries(data.graph.adj).forEach(([source, targets]) => {
      (targets as string[]).forEach((target) => {
        links.push({ source, target });
      });
    });
  }

  return links;
}

