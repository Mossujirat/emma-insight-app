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
      return throwError(() => new Error('Authentication token not found.'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${this.apiUrl}/driver-trip-data/${driverId}`;
    return this.http.get<DriverCurrentTrip>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getDriverTrip(driverId: string, tid: string): Observable<DriverCurrentTrip> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('TripDataService: No token found.');
      return throwError(() => new Error('Authentication token not found.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // สร้าง URL ที่มีทั้ง driverId และ tripId
    const url = `${this.apiUrl}/driver-trip-data/${driverId}/${tid}`;
    
    console.log(`TripDataService: Requesting specific trip data for driver: ${driverId}, trip: ${tid}`);
    
    return this.http.get<DriverCurrentTrip>(url, { headers }).pipe(
      catchError(this.handleError) // ใช้ error handler ร่วมกันได้
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.status === 401 || error.status === 403) {
      errorMessage = 'Unauthorized access. Please log in again.';
      // Consider calling this.authService.logout() here if appropriate
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    console.error('TripDataService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}