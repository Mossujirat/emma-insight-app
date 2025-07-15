/**
 * Represents the basic information for a driver.
 * Matches the 'driverInfo' object from the Mockoon response.
 */
export interface DriverInfo {
  name: string;
  licensePlateNo: string;
  vehicleType: string;
  avatarUrl: string;
  driverId: string;
}

/**
 * Represents the summary of driver statistics.
 * Matches the 'summary' object from the Mockoon response.
 */
export interface DriverSummary {
  totalDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  totalTime: number; // in seconds
  timePerTrip: number; // in seconds
  speedingDetected: number;
}

/**
 * Represents the event counts for a single day.
 * This is part of the 'dailyData' object structure.
 */
export interface DailyEventData {
  yawning: number;
  eye: number;
  microsleep: number;
  sleep: number;
  distraction: number;
}

export interface DailyTripLog {
  date: string;
  tripId: string;
  startTime: number; // In seconds
  distance: number;
  duration: number; // In seconds
  avgSpeed: number;
}

/**
 * The main data model for the statistic driver page from the Mockoon API.
 */
export interface StatisticDriverModel {
  driverInfo: DriverInfo;
  summary: DriverSummary;
  dailyData: { [date: string]: DailyEventData };
  minDate?: string;
  maxDate?: string;
  startDate?: string;
  endDate?: string;
  dailyTripLog?: DailyTripLog[];
}