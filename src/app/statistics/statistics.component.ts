import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  // Mock Data for demonstration
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
  driverStatus: 'Critical' | 'Normal' = 'Critical'; // 'Critical' or 'Normal'
  driverDetails = {
    accountID: 'B001',
    telephone: '081-2345709',
    vehicles: 'Bus',
    licensePlateNo: 'AD-1234'
  };

  constructor(private route: ActivatedRoute) { } // Inject ActivatedRoute

  ngOnInit(): void {
    // Read query parameters (e.g., driver ID from dashboard table click)
    this.route.queryParams.subscribe(params => {
      const driverId = params['driver'];
      if (driverId) {
        console.log(`StatisticsComponent: Received driver ID from route: ${driverId}`);
        // In a real app, you would fetch driver-specific data here
        // For now, let's update mock data based on a known ID
        if (driverId === 'B001') {
          // Keep current mock data as it already matches B001
        } else {
          // You could load different mock data for other drivers if you extend your data set
          this.driverName = 'Another Driver';
          this.driverStatus = 'Normal';
          this.driverDetails = {
            accountID: 'D002',
            telephone: '099-8765432',
            vehicles: 'Cargo',
            licensePlateNo: 'XY-5678'
          };
          this.detectedSpeedingCount = 0;
          this.maxSpeed = 80;
          this.avgSpeed = 75;
        }
      }
    });
  }
}