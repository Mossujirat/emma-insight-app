import { Component, OnInit } from '@angular/core';

// Define an interface for the device structure
export interface Device {
  id: string;
  name: string;
  licensePlateId: string;
  phone: string;
  carType: 'BUS' | 'CARGO';
  deviceId: string;
  date: Date; // For sorting
}

@Component({
  selector: 'app-user-device-list',
  standalone: false,
  templateUrl: './user-device-list.component.html',
  styleUrls: ['./user-device-list.component.css']
})

export class UserDeviceListComponent implements OnInit {
  
  // Mock data based on the provided image
  allDevices: Device[] = [
    { id: 'B001', name: 'David John', licensePlateId: 'AD-1234', phone: '0960051716', carType: 'BUS', deviceId: 'DFM-A001', date: new Date('2025-07-28') },
    { id: 'C001', name: 'Maria Onichan', licensePlateId: 'AD-1235', phone: '0960051716', carType: 'CARGO', deviceId: 'DFM-A002', date: new Date('2025-07-26') },
    { id: 'C002', name: 'Nguyen Si Thien', licensePlateId: 'AD-1236', phone: '0960051716', carType: 'CARGO', deviceId: 'DFM-A003', date: new Date('2025-07-25') },
    { id: 'B002', name: 'Mosskhun', licensePlateId: 'AD-1237', phone: '0960051716', carType: 'BUS', deviceId: 'DFM-A004', date: new Date('2025-07-29') }
  ];

  filteredDevices: Device[] = [];
  searchTerm: string = '';
  // Updated sortOrder type to include new options
  sortOrder: 'highToLow' | 'lowToHigh' | 'deviceIdAsc' | 'deviceIdDesc' = 'highToLow';

  constructor() { }

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let devices = [...this.allDevices];

    // Apply search filter
    if (this.searchTerm) {
      const lowercasedSearchTerm = this.searchTerm.toLowerCase();
      devices = devices.filter(device => 
        device.name.toLowerCase().includes(lowercasedSearchTerm) ||
        device.licensePlateId.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // Apply sort order
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