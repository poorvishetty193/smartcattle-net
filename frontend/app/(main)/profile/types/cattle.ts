export interface Cattle {
  id: string;
  breed: string;
  status: "Optimal" | "Alert" | "Critical";
}