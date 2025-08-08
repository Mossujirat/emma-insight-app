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
  sortOrder:  'deviceIdAsc' | 'deviceIdDesc' = 'deviceIdAsc';

  constructor(private deviceService: DeviceService) { }

  ngOnInit(): void {
    this.deviceService.refreshDevices().subscribe();
    
    this.deviceService.getDevices().subscribe(devices => {
      this.allDevices = devices.map(device => {
        return {
          ...device,
        };
      });
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let devices = [...this.allDevices];

    if (this.searchTerm) {
      const lowercasedSearchTerm = this.searchTerm.toLowerCase();
      devices = devices.filter(device => 
        device.Drivername.toLowerCase().includes(lowercasedSearchTerm) ||
        device.license.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    devices.sort((a, b) => {
      switch (this.sortOrder) {
        case 'deviceIdAsc':
          return a.device_id.localeCompare(b.device_id);
        case 'deviceIdDesc':
          return b.device_id.localeCompare(a.device_id);
        default:
          return 0;
      }
    });

    this.filteredDevices = devices;
  }

  deleteDevice(id: number, event: MouseEvent): void {
    event.stopPropagation(); // ป้องกันไม่ให้ router link ของแถวทำงาน
    
    // ใส่คำยืนยันก่อนลบ
    if (confirm('Are you sure you want to delete this device?')) {
      this.deviceService.deleteDevice(id).subscribe({
        next: () => {
          console.log(`Device with id: ${id} deleted successfully`);
          // ไม่ต้องทำอะไรเพิ่มที่นี่ เพราะ list จะ re-render อัตโนมัติจาก BehaviorSubject
        },
        error: (err) => {
          console.error(`Failed to delete device with id: ${id}`, err);
          // สามารถแสดง alert แจ้งเตือน error ได้
        }
      });
    }
  }
}