import { SimulationNodeDatum } from 'd3';

export interface NodeData extends SimulationNodeDatum {
  id: string;

  cluster?: string | null;
  direct_funder?: string | null;

  action_sequence?: string[];

  behavior_vector?: {
    first_fund_timestamp?: number;
    first_fund_amount?: number;
    total_tx?: number;
  };

  supply_holding?: {
    net_non_native_flow?: number;
    in_amount?: number;
    out_amount?: number;
    holding_percentage?: number;
  };

  x?: number;
  y?: number;
}