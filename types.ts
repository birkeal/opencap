
export interface Shareholder {
  id: string;
  name: string;
  type: 'founder' | 'investor';
  color: string;
  initialPercentage: number;
}

export interface Investment {
  investorId: string;
  name: string;
  percentage: number; // Post-money percentage ownership acquired in this round
  amount: number; // Optional: still useful for valuation tracking
}

export interface Round {
  id: string;
  name: string;
  preMoneyValuation: number;
  investments: Investment[];
  date: string;
}

export interface CapTableData {
  founders: Shareholder[];
  rounds: Round[];
}

export interface OwnershipStats {
  shareholderId: string;
  name: string;
  percentage: number;
  value: number;
  color: string;
}

export enum Theme {
  LIGHT = 'light',
  DIM = 'dim'
}
