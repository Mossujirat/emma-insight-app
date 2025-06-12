import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SummaryDriverData } from '../models/driver.model'; // Import the new data model
import { AuthService } from './auth.service'; // Import AuthService to get token

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private apiUrl = 'http://localhost:3001'; // Your Mockoon backend URL

  constructor(private http: HttpClient, private authService: AuthService) { } // Inject AuthService

  getSummaryDriverData(): Observable<SummaryDriverData> {
    const token = this.authService.getToken(); // Get token from AuthService
    if (!token) {
      // Handle case where token is missing (e.g., redirect to login or throw error)
      console.error('DashboardDataService: No token found. User is not authenticated.');
      return throwError(() => new Error('Authentication token not found.'));
    }

    // Include the token in the request headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Standard way to send JWT token
      'Content-Type': 'application/json'
    });

    console.log('DashboardDataService: Requesting summary driver data with token.');
    return this.http.get<SummaryDriverData>(`${this.apiUrl}/summary-dashboard-data`, { headers }).pipe(
      catchError(error => {
        let errorMessage = 'Failed to load dashboard data.';
        if (error.status === 401 || error.status === 403) {
          errorMessage = 'Unauthorized access. Please log in again.';
          this.authService.logout(); // Auto-logout on unauthorized
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        console.error('DashboardDataService: Error fetching data:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}