import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Device } from '../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private devices: Device[] = [
    { id: 'B001', name: 'David John', licensePlateId: 'AD-1234', phone: '0960051716', carType: 'BUS', deviceId: 'DFM-A001', date: new Date('2025-07-28') },
    { id: 'C001', name: 'Maria Onichan', licensePlateId: 'AD-1235', phone: '0960051716', carType: 'CARGO', deviceId: 'DFM-A002', date: new Date('2025-07-26') },
    { id: 'C002', name: 'Nguyen Si Thien', licensePlateId: 'AD-1236', phone: '0960051716', carType: 'CARGO', deviceId: 'DFM-A003', date: new Date('2025-07-25') },
    { id: 'B002', name: 'Mosskhun', licensePlateId: 'AD-1237', phone: '0960051716', carType: 'BUS', deviceId: 'DFM-A004', date: new Date('2025-07-29') }
  ];

  private devices$ = new BehaviorSubject<Device[]>(this.devices);

  constructor() { }

  getDevices(): Observable<Device[]> {
    return this.devices$.asObservable();
  }

  // เพิ่มเมธอดนี้เพื่อตรวจสอบ Device ID ซ้ำ
  isDeviceIdTaken(deviceId: string): Observable<boolean> {
    const isTaken = this.devices.some(d => d.deviceId.toLowerCase() === deviceId.toLowerCase());
    // จำลองการดีเลย์ของ network
    return of(isTaken).pipe(delay(500));
  }

  addDevice(deviceData: Omit<Device, 'id' | 'date'>): void {
    const isTaken = this.devices.some(d => d.deviceId.toLowerCase() === deviceData.deviceId.toLowerCase());
    if (isTaken) {
      console.error('This Device ID is already taken.');
      return; 
    }

    const newId = this.generateNewId(deviceData.carType);
    const newDevice: Device = {
      ...deviceData,
      id: newId,
      date: new Date()
    };
    this.devices.unshift(newDevice);
    this.devices$.next([...this.devices]);
  }

  private generateNewId(carType: 'BUS' | 'CARGO' | 'TAXI'): string {
    const prefix = carType.charAt(0);
    const existingIds = this.devices
        .filter(d => d.id.startsWith(prefix))
        .map(d => parseInt(d.id.substring(1)))
        .sort((a, b) => b - a);
    
    const lastNum = existingIds.length > 0 ? existingIds[0] : 0;
    return `${prefix}${(lastNum + 1).toString().padStart(3, '0')}`;
  }
}