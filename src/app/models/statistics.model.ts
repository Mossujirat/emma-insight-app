// src/app/models/statistics.model.ts

export interface StatisticsSummary {
  allVehicles: number;
  allTrips: number;
  totalKilometers: number;
}

export interface GraphDataPoint {
  month: string;
  warning: number;
  distraction: number;
  critical: number;
  harshBraking: number;
  speedingDetected: number;
  avgSpeed?: number; // Optional for speed group
  maxSpeed?: number; // Optional for speed group
}

export interface Ranking {
  rank: number;
  id: string;
  licensePlateNo: string;
  name: string;
  vehicles: string;
  warningDuration: string;
  quantity: number;
}

// Main interface for all data on this page
export interface StatisticsData {
  summary: StatisticsSummary;
  graphData: GraphDataPoint[];
  rankings: Ranking[];
}