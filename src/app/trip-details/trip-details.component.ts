import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { TripDataService } from '../services/trip-data.service';
import { Location } from '@angular/common'; // 1. Import the Location service
import { DriverCurrentTrip, TripEventData, TripEventSummary, LonLatPoint } from '../models/current-trip.model';
import { Driver } from '../models/driver.model';

interface LongdoMapCoordinates {
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-trip-details',
  standalone: false,
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css'
})

export class TripDetailsComponent {
  driverId: string | null = null;
  tid: string | null = null;
  driverTripData: DriverCurrentTrip | null = null;
  loadingData: boolean = true;

  // For Map
  mapCenter: LongdoMapCoordinates = { lon: 100.523186, lat: 13.736717 }; // Default to Bangkok
  mapZoom: number = 9;
  mapMarkers: Driver[] = []; 
  tripRouteLonLatPoints: LonLatPoint[] = [];

  // Property to hold the maximum count for bar graph scaling
  maxSummaryCount: number = 1;

  displayedTripEvents: TripEventData[] = []; // Property for reversed trip events
  selectedTripEvent: TripEventData | null = null; // To track selected trip event

  private overallTripCenter: LongdoMapCoordinates = { lon: 0, lat: 0 }; // Store overall trip center
  private defaultMapZoom: number = 9; // Store default zoom for trip view

  constructor(
    private route: ActivatedRoute,
    private tripDataService: TripDataService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.driverId = params.get('driverId');
      this.tid = params.get('tid');

      if (this.driverId && this.tid) {
        this.loadDriverTripData(this.driverId, this.tid);
      } else {
        console.error('Driver ID or Trip ID not found in route parameters.');
        this.loadingData = false;
      }
    });
  }

  loadDriverTripData(driverId: string, tripId: string): void {
    this.loadingData = true;
    this.tripDataService.getDriverTrip(driverId, tripId).subscribe({
      next: (data: DriverCurrentTrip) => {
        this.driverTripData = data;
        this.loadingData = false;
        console.log('Driver trip data loaded successfully:', data);
        this.calculateMaxSummaryCount(); // Calculate max count after data loads
        this.updateMapForTripEvents(); // Update map after data loads

        // Populate displayedTripEvents and select the *first* one by default (which is the oldest now)
        if (this.driverTripData.tripEventDataList) {
          // Sort by creation time to ensure correct order before reversing if data is not guaranteed sorted
          this.displayedTripEvents = [...this.driverTripData.tripEventDataList].sort((a, b) => {
            return new Date(a.created).getTime() - new Date(b.created).getTime();
          });
        }
      },
      error: (error) => {
        console.error('Failed to load driver trip data:', error);
        this.loadingData = false;
      }
    });
  }

  private calculateMaxSummaryCount(): void {
    if (this.driverTripData && this.driverTripData.tripEventSummaryData) {
      const summary = this.driverTripData.tripEventSummaryData;
      this.maxSummaryCount = Math.max(
        summary.yawningCount,
        summary.eyeCount,
        summary.microSleepCount,
        summary.sleepCount,
        summary.distractionCount,
        1 // Ensure it's at least 1 to avoid division by zero
      );
      console.log('Max summary count:', this.maxSummaryCount);
    } else {
      this.maxSummaryCount = 1;
    }
  }

  updateMapForTripEvents(): void {
    if (!this.driverTripData || !this.driverTripData.tripEventDataList) {
      this.mapMarkers = [];
      this.tripRouteLonLatPoints = [];
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

    // Extract longitude and latitude for route points
    this.tripRouteLonLatPoints = this.driverTripData.tripEventDataList
      .filter(event => event.longitude !== null && event.latitude !== null) // Only include points with valid coords
      .map(event => ({ lon: event.longitude, lat: event.latitude }));

    // Calculate and store overall trip center
    if (this.tripRouteLonLatPoints.length > 0) {
        let totalLon = 0;
        let totalLat = 0;
        this.tripRouteLonLatPoints.forEach(p => {
            totalLon += p.lon;
            totalLat += p.lat;
        });
        this.overallTripCenter = { lon: totalLon / this.tripRouteLonLatPoints.length, lat: totalLat / this.tripRouteLonLatPoints.length };
        this.defaultMapZoom = 12; // Set default zoom for the whole trip
    } else {
        this.overallTripCenter = { lon: 100.523186, lat: 13.736717 };
        this.defaultMapZoom = 9;
    }
    
    // Set initial map center to overall trip center
    this.mapCenter = this.overallTripCenter;
    this.mapZoom = this.defaultMapZoom;
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

  // Modified: Method to handle trip event click, move map, and toggle selection
  selectTripEvent(event: TripEventData): void {
    // Check if the same event is clicked again (to deselect)
    if (this.selectedTripEvent === event) {
      this.selectedTripEvent = null; // Deselect
      console.log('Trip event deselected. Moving map to overall trip center.');
      // Move map back to overall trip center
      this.mapCenter = this.overallTripCenter;
      this.mapZoom = this.defaultMapZoom;
    } else {
      this.selectedTripEvent = event; // Select new event
      console.log('Trip event selected:', event);
      // Move map to selected event's location
      if (event.longitude !== null && event.latitude !== null) {
        this.mapCenter = { lon: event.longitude, lat: event.latitude };
        this.mapZoom = 15; // Zoom in closer for specific event
      } else {
        console.warn('Selected event has no coordinates to move map to.');
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}