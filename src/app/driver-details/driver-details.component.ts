import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute

@Component({
  selector: 'app-driver-details', // Make sure selector matches new component name
  standalone: false,
  templateUrl: './driver-details.component.html',
  styleUrls: ['./driver-details.component.css']
})
export class DriverDetailsComponent implements OnInit {

  // Mock Data for demonstration (from old statistics component)
  tripEvents = [
    { distance: '89', time: '12:00 PM', duration: '3 hr 15 min', event: 'Micro-sleep' },
    { distance: '74', time: '11:30 AM', duration: '2 hr 45 min', event: 'Yawning duration' },
    { distance: '60', time: '11:07 AM', duration: '2 hr 22 min', event: 'Distraction' },
    { distance: '55', time: '10:45 AM', duration: '2 hr 0 min', event: 'Micro-sleep' },
    { distance: '40', time: '09:46 AM', duration: '1 hr 1 min', event: 'Sleep' },
    { distance: '30', time: '09:01 AM', duration: '16 min', event: 'Speeding Detected' },
    { distance: '0', time: '08:45 AM', duration: '0 min', event: 'Start Device' },
  ];

  detectedSpeedingCount: number = 2;
  maxSpeed: number = 50;
  avgSpeed: number = 50;

  driverName: string = 'Sarawut';
  driverStatus: 'Critical' | 'Normal' = 'Critical';
  driverDetails = {
    accountID: 'B001',
    telephone: '081-2345709',
    vehicles: 'Bus',
    licensePlateNo: 'AD-1234'
  };

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Read route parameters (e.g., driver ID from dashboard table click)
    this.route.queryParams.subscribe(params => {
      const driverId = params['driver']; // If using queryParams
      if (driverId) {
        console.log(`DriverDetailsComponent: Received driver ID from route: ${driverId}`);
        this.loadDriverData(driverId); // Load data based on ID
      }
    });

    // If using path parameters (e.g., /dashboard/driver-details/B001)
    this.route.paramMap.subscribe(params => {
      const driverId = params.get('id');
      if (driverId) {
        console.log(`DriverDetailsComponent: Received driver ID from path: ${driverId}`);
        this.loadDriverData(driverId);
      }
    });
  }

  // A method to simulate loading different driver data
  loadDriverData(driverId: string): void {
    if (driverId === 'B001') {
      this.driverName = 'Sarawut';
      this.driverStatus = 'Critical';
      this.driverDetails = {
        accountID: 'B001',
        telephone: '081-2345709',
        vehicles: 'Bus',
        licensePlateNo: 'AD-1234'
      };
      this.detectedSpeedingCount = 2;
      this.maxSpeed = 50;
      this.avgSpeed = 50;
      this.tripEvents = [
        { distance: '89', time: '12:00 PM', duration: '3 hr 15 min', event: 'Micro-sleep' },
        { distance: '74', time: '11:30 AM', duration: '2 hr 45 min', event: 'Yawning duration' },
        { distance: '60', time: '11:07 AM', duration: '2 hr 22 min', event: 'Distraction' },
        { distance: '55', time: '10:45 AM', duration: '2 hr 0 min', event: 'Micro-sleep' },
        { distance: '40', time: '09:46 AM', duration: '1 hr 1 min', event: 'Sleep' },
        { distance: '30', time: '09:01 AM', duration: '16 min', event: 'Speeding Detected' },
        { distance: '0', time: '08:45 AM', duration: '0 min', event: 'Start Device' },
      ];
    } else if (driverId === 'C001') {
      this.driverName = 'Moss Sujirat';
      this.driverStatus = 'Normal';
      this.driverDetails = {
        accountID: 'C001',
        telephone: '080-9876543',
        vehicles: 'Cargo',
        licensePlateNo: 'AD-1234'
      };
      this.detectedSpeedingCount = 0;
      this.maxSpeed = 70;
      this.avgSpeed = 65;
      this.tripEvents = [
        { distance: '50', time: '09:00 AM', duration: '1 hr', event: 'Normal Driving' },
        { distance: '40', time: '08:00 AM', duration: '45 min', event: 'Normal Driving' },
      ];
    }
    // Add more conditions for other driver IDs
  }
}