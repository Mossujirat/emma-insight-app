import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // This component no longer needs to manage logout directly if it's in dashboard-layout
    // But keeping for context if needed for other actions
  }

  // Navigate to driver details page with driver ID as a path parameter
  viewDriverDetails(driverId: string): void {
    console.log(`Navigating to driver details for: ${driverId}`);
    this.router.navigate(['/dashboard/driver-details', driverId]); // Use path parameter
  }

  // The logout method is now in DashboardLayoutComponent, but keeping a placeholder here if ever needed
  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/login']);
  // }
}