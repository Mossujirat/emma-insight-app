// src/app/models/statistics.model.ts

// --- Data Models for the new, efficient API structure ---

// Represents event counts for each vehicle type
export interface DailyEventData {
  [vehicleType: string]: number; // e.g., { "Bus": 5, "Cargo": 10, "Taxi": 3 }
}

// Represents all data for a single day
export interface DailyStatistics {
  warning: DailyEventData;
  critical: DailyEventData;
  distraction: DailyEventData;
  speeding: DailyEventData; // From API
  harshBraking: DailyEventData;
  // --- แก้ไขตรงนี้ ---
  avgSpeed: DailyEventData; // Now an object
  maxSpeed: DailyEventData; // Now an object
}

// The main, new StatisticModel
export interface StatisticModel {
  startDate: string;
  endDate: string;
  summary: {
    allVehicles: number;
    allTrips: number;
    totalKilometers: number;
  };
  rankingTable: RankDriverData[];
  dailyData: {
    [date: string]: DailyStatistics;
  };
}


// --- Data Models that the Component uses (No changes needed here) ---
// ... (ส่วนที่เหลือของไฟล์เหมือนเดิมทุกประการ) ...

export interface RankDriverData {
  driverId: string;
  driverName: string;
  vehicleType: string;
  carLicenseNo: string;
  driverRanking: number;
  warningDuration: number;
  criticalDuration: number;
  quantity: number;
}

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
  avgSpeed: number;
  maxSpeed: number;
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

export interface StatisticsData {
  summary: StatisticsSummary;
  graphData: GraphDataPoint[];
  rankings: Ranking[];
}