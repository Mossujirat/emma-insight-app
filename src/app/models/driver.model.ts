export interface Driver {
  driverId: string;
  driverName: string;
  vehicleType: string; // e.g., "Bus", "Cargo"
  carLicenseNo: string;
  updated: string; // Or Date, if you parse it
  available: string; // "Online", "Offline"
  status: string; // "Sleep", "Normal"
  currentLongitude: number;
  currentLatitude: number;
}

export interface SummaryDriverData {
  noOnline: number;
  noOffline: number;
  noWarning: number;
  noCritical: number;
  overallLongitude: number;
  overallLatitude: number;
  driverList: Driver[]; // List of Driver Model
}