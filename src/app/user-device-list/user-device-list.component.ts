import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../services/device.service';
import { Device } from '../models/device.model';

@Component({
  selector: 'app-user-device-list',
  standalone: false,
  templateUrl: './user-device-list.component.html',
  styleUrls: ['./user-device-list.component.css']
})

export class UserDeviceListComponent implements OnInit {
  allDevices: Device[] = [];
  filteredDevices: Device[] = [];
  searchTerm: string = '';
  sortOrder: 'highToLow' | 'lowToHigh' | 'deviceIdAsc' | 'deviceIdDesc' = 'highToLow';

  constructor(private deviceService: DeviceService) { }

  ngOnInit(): void {
    this.deviceService.getDevices().subscribe(devices => {
      this.allDevices = devices;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let devices = [...this.allDevices];

    if (this.searchTerm) {
      const lowercasedSearchTerm = this.searchTerm.toLowerCase();
      devices = devices.filter(device => 
        device.name.toLowerCase().includes(lowercasedSearchTerm) ||
        device.licensePlateId.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    devices.sort((a, b) => {
      switch (this.sortOrder) {
        case 'highToLow':
          return b.date.getTime() - a.date.getTime();
        case 'lowToHigh':
          return a.date.getTime() - b.date.getTime();
        case 'deviceIdAsc':
          return a.deviceId.localeCompare(b.deviceId);
        case 'deviceIdDesc':
          return b.deviceId.localeCompare(a.deviceId);
        default:
          return 0;
      }
    });

    this.filteredDevices = devices;
  }
}