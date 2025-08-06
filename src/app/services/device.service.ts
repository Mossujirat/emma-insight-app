import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Device } from '../models/device.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl = environment.apiUrl;
  private devices: Device[] = []; // ตัวแปรสำหรับเก็บข้อมูลอุปกรณ์ทั้งหมด
  private devices$ = new BehaviorSubject<Device[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    // โหลดข้อมูลทั้งหมดเมื่อ service ถูกสร้างขึ้น
    this.loadInitialDevices();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found');
      return new HttpHeaders();
    }
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // เมธอดสำหรับโหลดข้อมูลเริ่มต้น
  private loadInitialDevices(): void {
    this.http.get<Device[]>(`${this.apiUrl}/devices`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    ).subscribe(devices => {
      this.devices = devices;
      this.devices$.next([...this.devices]);
    });
  }

  // เมธอดนี้จะ return observable ที่มีข้อมูลล่าสุดอยู่เสมอ
  getDevices(): Observable<Device[]> {
    return this.devices$.asObservable();
  }

  getDeviceById(id: string): Observable<Device | undefined> {
    // หาข้อมูลจาก local array ก่อน
    const device = this.devices.find(d => d.id === id);
    if (device) {
      return of(device);
    }
    // ถ้าไม่เจอก็ยิงไปที่ server (เป็น fallback)
    return this.http.get<Device>(`${this.apiUrl}/devices/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // --- ส่วนของการตรวจสอบข้อมูลซ้ำ (ปรับปรุงใหม่) ---
  // จะตรวจสอบจากข้อมูลใน local array (this.devices)

  isDeviceIdTaken(deviceId: string): Observable<boolean> {
    const isTaken = this.devices.some(d => d.deviceId.toLowerCase() === deviceId.toLowerCase());
    return of(isTaken).pipe(delay(300)); // ใส่ delay เล็กน้อยเพื่อจำลอง async
  }

  isLicensePlateTaken(licensePlateId: string): Observable<boolean> {
    const isTaken = this.devices.some(d => d.licensePlateId.toLowerCase() === licensePlateId.toLowerCase());
    return of(isTaken).pipe(delay(300));
  }

  isValueTaken(fieldName: 'deviceId' | 'licensePlateId', value: string, currentDeviceId: string): Observable<boolean> {
    const isTaken = this.devices.some(
      d => d.id !== currentDeviceId && d[fieldName].toLowerCase() === value.toLowerCase()
    );
    return of(isTaken).pipe(delay(300));
  }


  addDevice(deviceData: Omit<Device, 'id' | 'date'>): Observable<Device> {
    // สมมติว่า server response มีหน้าตาแบบนี้: { status: string, car_id: string, date: string }
    return this.http.post<any>(`${this.apiUrl}/devices/add`, deviceData, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        // สร้าง object Device ที่สมบูรณ์ โดยรวมข้อมูลจากฟอร์ม
        // และข้อมูลที่ได้จาก server response
        const newDevice: Device = {
          ...deviceData, // ข้อมูลเดิมจากฟอร์ม (name, licensePlateId, phone, carType, deviceId)
          id: response.car_id, // ใช้ 'car_id' จาก response มาเป็น 'id'
          date: new Date(response.date) // ใช้ 'date' จาก response
        };
        return newDevice;
      }),
      tap(newDevice => {
        // เพิ่มข้อมูลใหม่ (ที่สมบูรณ์แล้ว) ลงใน local array และอัพเดท BehaviorSubject
        this.devices.unshift(newDevice);
        this.devices$.next([...this.devices]);
      }),
      catchError(this.handleError)
    );
  }

  updateDevice(updatedDevice: Device): Observable<Device> {
    return this.http.put<Device>(`${this.apiUrl}/devices/${updatedDevice.id}`, updatedDevice, { headers: this.getAuthHeaders() }).pipe(
      tap(returnedDevice => {
        // อัพเดทข้อมูลใน local array และ BehaviorSubject
        const index = this.devices.findIndex(d => d.id === returnedDevice.id);
        if (index !== -1) {
          this.devices[index] = returnedDevice;
          this.devices$.next([...this.devices]);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteDevice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/devices/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        // ลบข้อมูลออกจาก local array และอัพเดท BehaviorSubject
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