
export interface FinancialMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

export interface SwotItem {
  point: string;
  description: string;
  isHighRisk?: boolean;
}

export interface AnalysisSource {
  title: string;
  uri: string;
}

export interface AnalysisResponse {
  executiveSummary: string;
  decision: 'Buy' | 'Hold' | 'Sell' | 'Wait';
  decisionRationale: string;
  financialData: FinancialMetric[];
  marketInsights: string[];
  managementSentiment: string;
  swot: {
    strengths: SwotItem[];
    weaknesses: SwotItem[];
    opportunities: SwotItem[];
    threats: SwotItem[];
  };
  hiddenRisks: string[];
  sources?: AnalysisSource[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
