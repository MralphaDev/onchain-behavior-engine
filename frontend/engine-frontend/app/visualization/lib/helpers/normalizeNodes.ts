import { NodeData } from '../types';

export function normalizeNodes(input: any): NodeData[] {
  if (!input) return [];

  // array format
  if (Array.isArray(input)) {
    return input.map((n: any, i: number) => ({
      ...n,
      id: n.id || n.wallet || n.address || `node_${i}`,
    }));
  }

  // object map format
  return Object.entries(input).map(([id, node]: any) => ({
    id,
    ...(node || {}),
  }));
}