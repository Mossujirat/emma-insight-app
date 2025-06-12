import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DriverCurrentTrip } from '../models/current-trip.model'; // Import the new data model
import { AuthService } from './auth.service'; // Import AuthService to get token

@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  private apiUrl = 'http://localhost:3001'; // Your Mockoon backend URL

  constructor(private http: HttpClient, private authService: AuthService) { }

  getDriverCurrentTrip(driverId: string): Observable<DriverCurrentTrip> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('TripDataService: No token found. User is not authenticated.');
      return throwError(() => new Error('Authentication token not found.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log(`TripDataService: Requesting trip data for driver: ${driverId} with token.`);
    // Assuming a GET endpoint like /driver-trip-data/:driverId
    return this.http.get<DriverCurrentTrip>(`${this.apiUrl}/driver-trip-data/${driverId}`, { headers }).pipe(
      catchError(error => {
        let errorMessage = `Failed to load trip data for driver ${driverId}.`;
        if (error.status === 401 || error.status === 403) {
          errorMessage = 'Unauthorized access. Please log in again.';
          this.authService.logout(); // Auto-logout on unauthorized
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        console.error('TripDataService: Error fetching data:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}