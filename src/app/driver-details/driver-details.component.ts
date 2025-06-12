import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TripDataService } from '../services/trip-data.service'; // Import TripDataService
import { DriverCurrentTrip, TripEventData, TripEventSummary } from '../models/current-trip.model'; // Import models
import { Driver } from '../models/driver.model'; // Ensure Driver is imported if needed for marker icons

// Define a type for map coordinates for clarity (matching LongdoMapComponent)
interface LongdoMapCoordinates {
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-driver-details',
  standalone: false,
  templateUrl: './driver-details.component.html',
  styleUrls: ['./driver-details.component.css']
})

export class DriverDetailsComponent implements OnInit {
  driverId: string | null = null;
  driverTripData: DriverCurrentTrip | null = null;
  loadingData: boolean = true;

  // For Map
  mapCenter: LongdoMapCoordinates = { lon: 100.523186, lat: 13.736717 }; // Default to Bangkok
  mapZoom: number = 9;
  mapMarkers: Driver[] = []; // Drivers for map markers (using Driver type for simplicity, though it's trip events)
                            // We will map TripEventData to a temporary Driver-like object for map markers.

  constructor(
    private route: ActivatedRoute,
    private tripDataService: TripDataService // Inject TripDataService
  ) { }

  ngOnInit(): void {
    // Subscribe to route params to get the driverId
    this.route.paramMap.subscribe(params => {
      this.driverId = params.get('id');
      if (this.driverId) {
        this.loadDriverTripData(this.driverId);
      } else {
        console.error('Driver ID not found in route parameters.');
        this.loadingData = false;
        // Optionally, show a message or redirect
      }
    });
  }

  loadDriverTripData(id: string): void {
    this.loadingData = true;
    this.tripDataService.getDriverCurrentTrip(id).subscribe({
      next: (data: DriverCurrentTrip) => {
        this.driverTripData = data;
        this.loadingData = false;
        console.log('Driver trip data loaded successfully:', data);
        this.updateMapForTripEvents(); // Update map after data loads
      },
      error: (error) => {
        console.error('Failed to load driver trip data:', error);
        this.loadingData = false;
        // Optionally, display an error message on UI
      }
    });
  }

  updateMapForTripEvents(): void {
    if (!this.driverTripData || !this.driverTripData.tripEventDataList) {
      this.mapMarkers = [];
      return;
    }

    // Transform TripEventDataList into a format suitable for LongdoMapComponent's @Input drivers
    this.mapMarkers = this.driverTripData.tripEventDataList.map(event => ({
      driverId: this.driverTripData?.driverId || '',
      driverName: this.driverTripData?.driverName || '',
      carLicenseNo: this.driverTripData?.carLicenseNo || '',
      vehicleType: this.driverTripData?.vehicleType || '',
      updated: event.created, // Use event creation time for 'updated'
      available: 'Online', // Assuming trip events imply online
      status: this.getDriverStatusForMap(event.eventStatus), // Map eventStatus to driver status for icon
      currentLongitude: event.longitude,
      currentLatitude: event.latitude
    }));

    // Center map on the first event, or overall center of events
    if (this.mapMarkers.length > 0) {
        const firstEvent = this.mapMarkers[0];
        this.mapCenter = { lon: firstEvent.currentLongitude, lat: firstEvent.currentLatitude };
        this.mapZoom = 12; // Zoom in for detailed trip
    } else {
        // If no events, center on driver's last known location or default
        this.mapCenter = { lon:  100.523186, lat:  13.736717 };
        this.mapZoom = 9;
    }
  }

  // Helper to map TripEventData's eventStatus to the Driver status for icon logic
  private getDriverStatusForMap(eventStatus: string): string {
      switch (eventStatus) {
          case 'Speeding Detected': return 'Critical';
          case 'Micro-sleep': return 'Critical';
          case 'Sleep': return 'Critical';
          case 'Yawning duration': return 'Warning';
          case 'Distraction': return 'Warning';
          default: return 'Normal'; // "Start Device", etc.
      }
  }
}