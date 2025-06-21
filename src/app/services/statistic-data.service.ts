// src/app/services/statistics-data.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { StatisticsData, GraphDataPoint } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsDataService {

  constructor() { }

  // In a real app, this would make an HTTP call to your backend
  getStatisticsData(dateFrom?: string, dateTo?: string): Observable<StatisticsData> {
    
    // If dates are provided, you would normally pass them to the backend.
    // Here, we'll just log them and return the same mock data.
    console.log(`Fetching statistics data from: ${dateFrom || 'start'} to: ${dateTo || 'end'}`);

    const mockData: StatisticsData = {
      summary: {
        allVehicles: 54,
        allTrips: 100,
        totalKilometers: 1423,
      },
      graphData: [
        { month: 'Jan', warning: 280, distraction: 500, critical: 200, harshBraking: 150, speedingDetected: 400 },
        { month: 'Feb', warning: 300, distraction: 450, critical: 220, harshBraking: 180, speedingDetected: 420 },
        { month: 'Mar', warning: 250, distraction: 520, critical: 180, harshBraking: 200, speedingDetected: 450 },
        { month: 'Apr', warning: 320, distraction: 480, critical: 250, harshBraking: 160, speedingDetected: 480 },
        { month: 'May', warning: 400, distraction: 400, critical: 300, harshBraking: 140, speedingDetected: 520 },
        { month: 'Jun', warning: 380, distraction: 350, critical: 280, harshBraking: 120, speedingDetected: 550 },
        { month: 'Jul', warning: 350, distraction: 380, critical: 260, harshBraking: 100, speedingDetected: 580 },
        { month: 'Aug', warning: 200, distraction: 320, critical: 150, harshBraking: 50, speedingDetected: 600 },
        { month: 'Sep', warning: 180, distraction: 300, critical: 120, harshBraking: 40, speedingDetected: 650 },
        { month: 'Oct', warning: 220, distraction: 350, critical: 180, harshBraking: 60, speedingDetected: 680 },
        { month: 'Nov', warning: 250, distraction: 400, critical: 200, harshBraking: 80, speedingDetected: 700 },
        { month: 'Dec', warning: 300, distraction: 450, critical: 240, harshBraking: 100, speedingDetected: 750 },
      ],
      rankings: [
        { rank: 1, id: 'B001', licensePlateNo: 'AD-1234', name: 'Sarawut', vehicles: 'Bus', warningDuration: '34 times/hour', quantity: 89 },
        { rank: 2, id: 'C001', licensePlateNo: 'AD-1234', name: 'Moss Sujirat', vehicles: 'Cargo', warningDuration: '20 times/hour', quantity: 78 },
        { rank: 3, id: 'B003', licensePlateNo: 'AD-1234', name: 'Kajslee', vehicles: 'Bus', warningDuration: '19 times/hour', quantity: 70 },
        { rank: 4, id: 'C004', licensePlateNo: 'AD-1234', name: 'Tasaya', vehicles: 'Cargo', warningDuration: '15 times/hour', quantity: 65 },
        { rank: 5, id: 'B002', licensePlateNo: 'AD-1234', name: 'Aleeya', vehicles: 'Bus', warningDuration: '10 times/hour', quantity: 50 },
      ]
    };

    // Simulate network delay
    return of(mockData).pipe(delay(500));
  }
}