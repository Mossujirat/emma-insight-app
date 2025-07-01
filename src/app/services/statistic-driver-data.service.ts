import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { StatisticDriverModel } from '../models/statistic-driver.model';

@Injectable({
  providedIn: 'root'
})

export class StatisticDriverDataService {
  private apiUrl = 'http://localhost:3001';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getStatisticDriverData(driverId: string, dateFrom?: string, dateTo?: string): Observable<StatisticDriverModel> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Authentication token not found.'));
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    const url = `${this.apiUrl}/driver-statistics/${driverId}`;

    return this.http.get<StatisticDriverModel>(url, { headers, params }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: any): Observable<never> {
    if (error.status === 401 || error.status === 403) {
      this.authService.logout();
    }
    console.error('StatisticDriverDataService Error:', error);
    return throwError(() => new Error('Failed to load driver statistics data; please try again later.'));
  }
}