// ... (Existing User, LoginCredentials, RegistrationData, Driver, SummaryDriverData, etc. interfaces) ...

export interface TripEventData {
  eventId: string;
  created: string; // Timestamp or String
  diffTime: string;
  distance: number; // Assuming this is Int
  eventStatus: string; // e.g., "Speeding Detected", "Micro-sleep"
  longitude: number;
  latitude: number;
  eventImages?: string[]; // List of String (URLs)
}

export interface TripEventSummary {
  yawningCount: number;
  eyeCount: number;
  microSleepCount: number;
  sleepCount: number;
  distractionCount: number;
}

export interface DriverCurrentTrip {
  driverId: string;
  driverName: string;
  carLicenseNo: string;
  telephone: string;
  vehicleType: string;
  status: string; // "Sleep", "Normal"
  currentTripId: string;
  maxSpeed: number;
  avgSpeed: number;
  noSpeedingDetected: number;
  tripEventDataList: TripEventData[]; // List of Trip Event Data Model
  tripEventSummaryData: TripEventSummary; // Trip Event Summary Model
  updated: string; // Timestamp or String
}