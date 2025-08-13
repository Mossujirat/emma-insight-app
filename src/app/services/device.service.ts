import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Device } from '../models/device.model';
import { AuthService } from './auth.service';
// import { environment } from '../../environments/environment.prod';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl = environment.apiUrl;
  private devices: Device[] = []; 
  private devices$ = new BehaviorSubject<Device[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    this.refreshDevices().subscribe();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found');
      return new HttpHeaders();
    }
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  refreshDevices(): Observable<Device[]> {
    console.log("Refresh");
    return this.http.get<Device[]>(`${this.apiUrl}/devices`, { headers: this.getAuthHeaders() }).pipe(
      tap(devices => {
        this.devices = devices;
        this.devices$.next([...this.devices]);
      }),
      catchError(this.handleError)
    );
  }

  getDevices(): Observable<Device[]> {
    return this.devices$.asObservable();
  }

  getDeviceById(id: string): Observable<Device | undefined> {
    const device = this.devices.find(d => d.car_id === id);
    if (device) {
      return of(device);
    }
    return this.http.get<Device>(`${this.apiUrl}/devices/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  isDeviceIdTaken(deviceId: string): Observable<boolean> {
    const isTaken = this.devices.some(d => d.device_id.toLowerCase() === deviceId.toLowerCase());
    return of(isTaken).pipe(delay(300));
  }

  isLicensePlateTaken(licensePlateId: string): Observable<boolean> {
    const isTaken = this.devices.some(d => d.license.toLowerCase() === licensePlateId.toLowerCase());
    return of(isTaken).pipe(delay(300));
  }

  isValueTaken(fieldName: 'device_id' | 'license', value: string, currentDeviceId: string): Observable<boolean> {
    const isTaken = this.devices.some(
      d => d.device_id !== currentDeviceId && d[fieldName].toLowerCase() === value.toLowerCase()
    );
    return of(isTaken).pipe(delay(300));
  }

  addDevice(deviceData: Omit<Device, 'id' | 'date'>): Observable<Device> {
    return this.http.post<any>(`${this.apiUrl}/devices/add`, deviceData, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateDevice(updatedDevice: Device): Observable<Device> {
    return this.http.post<any>(`${this.apiUrl}/devices/${updatedDevice.id}`, updatedDevice, { headers: this.getAuthHeaders() }).pipe(
      tap(returnedDevice => {
        const index = this.devices.findIndex(d => d.id === returnedDevice.id);
        if (index !== -1) {
          this.devices[index] = returnedDevice;
          this.devices$.next([...this.devices]);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteDevice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/devices/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        this.devices = this.devices.filter(d => d.id !== id);
        this.devices$.next([...this.devices]);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred in DeviceService:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}