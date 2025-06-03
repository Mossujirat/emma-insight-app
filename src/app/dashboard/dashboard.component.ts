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

  // Navigate to statistics page with driver ID (simulated)
  viewDriverDetails(driverId: string): void {
    console.log(`Navigating to details for driver: ${driverId}`);
    // In a real app, you might pass the ID as a route parameter to the statistics page
    this.router.navigate(['/dashboard/statistics'], { queryParams: { driver: driverId } });
  }

  // The logout method is now in DashboardLayoutComponent, but keeping a placeholder here if ever needed
  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/login']);
  // }
}