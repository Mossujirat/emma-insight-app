// src/app/services/statistic-data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { StatisticModel } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsDataService {

  private apiUrl = 'http://localhost:3001';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getStatisticsData(dateFrom?: string, dateTo?: string): Observable<StatisticModel> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Authentication token not found.'));
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    let params = new HttpParams();
    if (dateFrom) params = params.append('dateFrom', dateFrom);
    if (dateTo) params = params.append('dateTo', dateTo);

    return this.http.get<StatisticModel>(`${this.apiUrl}/statistics`, { headers, params }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Failed to load statistics data.';
    if (error.status === 401 || error.status === 403) {
      this.authService.logout();
    }
    console.error('StatisticsDataService: Error fetching data:', error);
    return throwError(() => new Error(errorMessage));
  }
}