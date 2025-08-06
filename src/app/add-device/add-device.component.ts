import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { DeviceService } from '../services/device.service';
import { Device } from '../models/device.model';

@Component({
  selector: 'app-add-device',
  standalone: false,
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.css']
})

export class AddDeviceComponent implements OnInit {
  addDeviceForm!: FormGroup;
  successMessage = '';
  vehicleTypes: Device['carType'][] = ['BUS', 'CARGO', 'TAXI'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    this.addDeviceForm = this.fb.group({
      name: ['', Validators.required],
      deviceId: [
        '',
        [Validators.required],
        [this.deviceIdValidator()]
      ],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      licensePlateId: [
        '', 
        [Validators.required],
        [this.licensePlateValidator()]
      ],
      carType: ['BUS', Validators.required]
    });
  }

  // Custom Async Validator for Device ID
  deviceIdValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Use timer to debounce the check
      return timer(500).pipe(
        switchMap(() => {
          if (!control.value) {
            return of(null);
          }
          return this.deviceService.isDeviceIdTaken(control.value).pipe(
            map(isTaken => (isTaken ? { deviceIdTaken: true } : null)),
            catchError(() => of(null)) // In case of service error, treat as valid
          );
        })
      );
    };
  }

  licensePlateValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return timer(500).pipe(
        switchMap(() => {
          if (!control.value) {
            return of(null);
          }
          return this.deviceService.isLicensePlateTaken(control.value).pipe(
            map(isTaken => (isTaken ? { licensePlateTaken: true } : null)),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  // Helper getter for the template
  get deviceId() {
    return this.addDeviceForm.get('deviceId');
  }

  get licensePlateId() {
    return this.addDeviceForm.get('licensePlateId');
  }

  selectVehicle(type: Device['carType']): void {
    this.addDeviceForm.patchValue({ carType: type });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/device-list']);
  }

  onSubmit(): void {
    this.addDeviceForm.markAllAsTouched();
    if (this.addDeviceForm.invalid) {
      return;
    }

    this.deviceService.addDevice(this.addDeviceForm.value).subscribe({
      next: () => {
        this.successMessage = 'Device added successfully!';
        setTimeout(() => {
          this.router.navigate(['/dashboard/device-list']);
        }, 1500);
      },
      error: (err) => {
        console.error('Failed to add device', err);
        // สามารถแสดง error message บนหน้าจอได้
      }
    });
  }
}