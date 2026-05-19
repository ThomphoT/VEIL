export type Decision = "APPROVE" | "HOLD" | "ESCALATE" | "VERIFY";

export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  recipient: string;
  timestamp: string;
  channel: string;
  customer: {
    name: string;
    segment: string;
    homeCountry: string;
    normalTransactionWindow: string;
  };
  device: {
    id: string;
    fingerprint: string;
    trustLevel: string;
    firstSeen: string;
  };
  geo: {
    originCountry: string;
    ipCountry: string;
    jurisdictionRisk: string;
  };
};

export type AgentResult = {
  agent: string;
  score: number;
  confidence: number;
  finding: string;
  recommendation: string;
};

export type AnalysisResult = {
  transaction: Transaction;
  agents: AgentResult[];
  decision: Decision;
  confidence: number;
  risk_score: number;
  reason: string;
  narrative: string;
};

export type StreamEvent =
  | { type: "transaction"; transaction: Transaction }
  | { type: "agent_start"; agent: string; message: string }
  | { type: "agent_result"; result: AgentResult }
  | { type: "orchestrator"; decision: Decision; confidence: number; risk_score: number; reason: string }
  | { type: "explainability"; narrative: string }
  | { type: "complete"; analysis: AnalysisResult }
  | { type: "error"; message: string };
