import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardDataService } from '../services/dashboard-data.service'; // Import DashboardDataService
import { SummaryDriverData, Driver } from '../models/driver.model'; // Import data models

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  summaryData: SummaryDriverData | null = null; // Property to hold summary data
  driverList: Driver[] = []; // Property to hold the list of drivers
  filteredDriverList: Driver[] = [];
  loadingData: boolean = true; // For a loading indicator

  // Filter state properties
  vehicleTypes: string[] = ['All', 'Bus', 'Cargo', 'Taxi']; // Available vehicle types
  selectedVehicleTypes: string[] = ['All']; // Initially 'All' is selected

  // Filter state properties for Status (now single-select)
  driverStatuses: string[] = ['All', 'Online', 'Warning', 'Critical', 'Offline'];
  selectedStatus: string = 'All'; // Changed to single string, as only one choice is active

  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardDataService: DashboardDataService // Inject DashboardDataService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadingData = true;
    this.dashboardDataService.getSummaryDriverData().subscribe({
      next: (data: SummaryDriverData) => {
        this.summaryData = data;
        this.driverList = data.driverList; // Populate driver list for the table
        this.loadingData = false;
        console.log('Dashboard data loaded successfully:', data);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.loadingData = false;
        // Optionally display an error message on the UI
      }
    });
  }

  viewDriverDetails(driverId: string): void {
    console.log(`Navigating to driver details for: ${driverId}`);
    this.router.navigate(['/dashboard/driver-details', driverId]);
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
        this.selectedVehicleTypes.includes(driver.vehicleType)
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
}