import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardDataService } from '../services/dashboard-data.service'; // Import DashboardDataService
import { SummaryDriverData, Driver } from '../models/driver.model'; 
import { Subject, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

// Define a type for map coordinates for clarity
interface MapCoordinates {
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  summaryData: SummaryDriverData | null = null; 
  driverList: Driver[] = []; 
  filteredDriverList: Driver[] = [];
  filteredMapDrivers: Driver[] = [];
  loadingData: boolean = true; 

  vehicleTypes: string[] = ['All', 'bus', 'cargo', 'taxi']; 
  selectedVehicleTypes: string[] = ['All']; 

  driverStatuses: string[] = ['All', 'Online', 'Warning', 'Critical', 'Offline'];
  selectedStatus: string = 'All'; 

  searchTerm: string = '';

  mapCenter: MapCoordinates = { lon: 100.55, lat: 13.75 };
  mapZoom: number = 12; 

  selectedMapStatus: string = 'All';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardDataService: DashboardDataService // Inject DashboardDataService
  ) { }

  ngOnInit(): void {
    // Polling every 20 seconds (20000 milliseconds)
    timer(0, 20000) // Start immediately, then every 20 seconds
      .pipe(
        switchMap(() => this.dashboardDataService.getSummaryDriverData()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (data: SummaryDriverData) => {
          this.summaryData = data;
          this.driverList = data.driverList;
          this.loadingData = false;
          console.log('Dashboard data reloaded successfully:', data);
          this.applyFilters();
          this.filterMapDrivers(this.selectedMapStatus);
        },
        error: (error) => {
          console.error('Failed to reload dashboard data:', error);
          this.loadingData = false;
          // Optionally display an error message on the UI
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  viewDriverDetails(driverId: string): void {
    console.log(`Navigating to driver details for: ${driverId}`);
    this.router.navigate(['/dashboard/home', driverId]);
  }

  toggleVehicleTypeFilter(type: string): void {
    if (type === 'All') {
      // If 'All' is clicked, select only 'All'
      this.selectedVehicleTypes = ['All'];
    } else {
      // If a specific type is clicked
      if (this.selectedVehicleTypes.includes('All')) {
        // If 'All' was selected, deselect it and select the clicked type
        this.selectedVehicleTypes = [type];
      } else if (this.selectedVehicleTypes.includes(type)) {
        // If the type was already selected, deselect it
        this.selectedVehicleTypes = this.selectedVehicleTypes.filter(t => t !== type);
        // If no types are selected, default back to 'All'
        if (this.selectedVehicleTypes.length === 0) {
          this.selectedVehicleTypes = ['All'];
        }
      } else {
        // If the type was not selected, select it
        this.selectedVehicleTypes.push(type);
      }
    }
    this.applyFilters(); // Re-apply filters after selection changes
  }

  // Method to toggle status filter (SINGLE-SELECT LOGIC)
  toggleStatusFilter(status: string): void {
    this.selectedStatus = status; 
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  // Modified: Method to apply all active filters to the driver list
  applyFilters(): void {
    let tempFilteredList = [...this.driverList];

    // Apply Vehicle Type Filter (remains multi-select)
    if (!this.selectedVehicleTypes.includes('All') && this.selectedVehicleTypes.length > 0) {
      tempFilteredList = tempFilteredList.filter(driver =>
        this.selectedVehicleTypes.includes(driver.vehicleType.toLowerCase())
      );
    }

    // Apply Status Filter (now single-select)
    if (this.selectedStatus !== 'All') { // If a specific status is selected
        tempFilteredList = tempFilteredList.filter(driver => {
            // Logic to match the button text to driver properties
            if (this.selectedStatus === 'Online' && driver.available === 'Online') {
                return true;
            }
            if (this.selectedStatus === 'Warning' && driver.status === 'Warning') {
                return true;
            }
            if (this.selectedStatus === 'Critical' && driver.status === 'Critical') {
                return true;
            }
            if (this.selectedStatus === 'Offline' && driver.available === 'Offline') {
                return true;
            }
            return false;
        });
    }

    // Apply Search Filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.trim().toLowerCase();
      const initialCount = tempFilteredList.length;
      tempFilteredList = tempFilteredList.filter(driver => {
        // Check driverId, carLicenseNo, driverName
        return (driver.driverId && driver.driverId.toLowerCase().includes(searchLower)) ||
               (driver.carLicenseNo && driver.carLicenseNo.toLowerCase().includes(searchLower)) ||
               (driver.driverName && driver.driverName.toLowerCase().includes(searchLower));
      });
    }
    
    this.filteredDriverList = tempFilteredList;
  }

  // Modified: Filter drivers specifically for the map, now uses selectedMapStatus
  filterMapDrivers(status: string): void {
    // If status is 'All', return all drivers with coordinates.
    // Otherwise, filter by the specific status.
    if (!this.driverList) {
      this.filteredMapDrivers = [];
      return;
    }

    let driversForMap: Driver[] = [];
    if (status === 'All') {
      driversForMap = this.driverList.filter(d => d.currentLongitude !== null && d.currentLatitude !== null);
    } else {
      driversForMap = this.driverList.filter(driver => {
        if (driver.currentLongitude === null || driver.currentLatitude === null) return false;
        if (status === 'Online' && driver.available === 'Online') return true;
        if (status === 'Warning' && driver.status === 'Warning') return true;
        if (status === 'Critical' && driver.status === 'Critical') return true;
        if (status === 'Offline' && driver.available === 'Offline') return true;
        return false;
      });
    }
    this.filteredMapDrivers = driversForMap;
  }

  // Modified: Center map based on clicked status, and toggle selectedMapStatus
  centerMapOnStatus(status: string): void {
    // Toggle logic: If the same button is clicked again, deselect it (go back to 'All')
    if (this.selectedMapStatus === status) {
      this.selectedMapStatus = 'All'; // Deselect current, show all
    } else {
      this.selectedMapStatus = status; // Select the new status
    }
    
    this.filterMapDrivers(this.selectedMapStatus); // Filter map drivers based on new selection

    if (this.filteredMapDrivers.length > 0) {
      let totalLon = 0;
      let totalLat = 0;
      this.filteredMapDrivers.forEach(driver => {
        totalLon += driver.currentLongitude || 0;
        totalLat += driver.currentLatitude || 0;
      });

      this.mapCenter = {
        lon: totalLon / this.filteredMapDrivers.length,
        lat: totalLat / this.filteredMapDrivers.length
      };
      this.mapZoom = 12; // Zoom in a bit when focusing on a specific group
      console.log(`Map centered on ${this.selectedMapStatus} drivers:`, this.mapCenter);
    } else {
      console.log(`No ${this.selectedMapStatus} drivers found to center map.`);
      // Revert to overall center/zoom if no drivers match selected status
      this.mapCenter = { lon: this.summaryData?.overallLongitude || 100.55, lat: this.summaryData?.overallLatitude || 13.75 };
      this.mapZoom = 12; // Revert to broader view
    }
  }
}