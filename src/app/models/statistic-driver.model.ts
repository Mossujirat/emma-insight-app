/**
 * Represents the basic information for a driver.
 * Matches the 'driverInfo' object from the Mockoon response.
 */
export interface DriverInfo {
  name: string;
  licensePlateNo: string;
  vehicleType: string;
  avatarUrl: string;
  driverId: string; // Assuming driverId is available here or can be added
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
  warning: number;
  critical: number;
  distraction: number;
  speeding: number;
  avgSpeed: number;
  maxSpeed: number;
}

/**
 * The main data model for the statistic driver page from the Mockoon API.
 */
export interface StatisticDriverModel {
  driverInfo: DriverInfo;
  summary: DriverSummary;
  dailyData: { [date: string]: DailyEventData };
  // The following properties can be added if the API provides them, for date picker logic
  minDate?: string;
  maxDate?: string;
  startDate?: string;
  endDate?: string;
  dailyTripLog?: any[]; // Placeholder for trip logs if they are part of this model
}