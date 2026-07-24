export type CowStatus = "CRITICAL" | "HEALTHY" | "WARNING" | "STABLE";

export interface MetricBar {
  label: string;
  value: number;
  color: string;
}

export interface PredictionCard {
  icon: string;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}

export interface Cow {
  id: string;
  image: string;
  lactation: string;
  status: CowStatus;

  metrics: MetricBar[];

  prediction1: PredictionCard;
  prediction2: PredictionCard;

  production: number;
  healthScore: number;
  stability: number;
  stress: number;

  milkYield?: number;
  thi?: number;
}