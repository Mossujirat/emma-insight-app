import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, delay, first } from 'rxjs/operators';
import { DeviceService } from '../services/device.service';
import { Device } from '../models/device.model';

@Component({
  selector: 'app-edit-device',
  standalone: false,
  templateUrl: './edit-device.component.html',
  styleUrls: ['./edit-device.component.css']
})
export class EditDeviceComponent implements OnInit {
  editDeviceForm!: FormGroup;
  device: Device | undefined;
  deviceId: string | null = null;
  successMessage = '';
  errorMessage = '';
  vehicleTypes: Device['cartype'][] = ['BUS', 'CARGO', 'TAXI'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.paramMap.get('id');
    console.log(this.deviceId);
    if (!this.deviceId) {
      this.errorMessage = "Device ID not found in URL.";
      return;
    }

    this.deviceService.getDeviceById(this.deviceId).pipe(first()).subscribe(device => {
      if (device) {
        this.device = device;
        this.initializeForm();
      } else {
        this.errorMessage = "Device not found.";
      }
    });
  }

  initializeForm(): void {
    this.editDeviceForm = this.fb.group({
      name: [this.device?.Drivername, Validators.required],
      deviceId: [
        this.device?.device_id,
        [Validators.required],
        [this.uniqueValidator('device_id')]
      ],
      phone: [this.device?.phonecall, [Validators.required, Validators.pattern('^[0-9]*$')]],
      licensePlateId: [
        this.device?.license,
        [Validators.required],
        [this.uniqueValidator('license')]
      ],
      carType: [this.device?.cartype, Validators.required]
    });
  }

  uniqueValidator(fieldName: 'device_id' | 'license'): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || !this.device) {
        return of(null);
      }
      return of(control.value).pipe(
        delay(500),
        switchMap(value => 
          this.deviceService.isValueTaken(fieldName, value, this.device!.device_id).pipe(
            map(isTaken => (isTaken ? { valueTaken: true } : null))
          )
        )
      );
    };
  }
  
  get formControls() {
    return this.editDeviceForm.controls;
  }

  selectVehicle(type: Device['cartype']): void {
    this.editDeviceForm.patchValue({ carType: type });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/device-list']);
  }

  onSubmit(): void {
    this.editDeviceForm.markAllAsTouched();
    if (this.editDeviceForm.invalid || this.editDeviceForm.pending) {
      return;
    }

    if (this.device) {
      const updatedData: Device = {
          ...this.device,
          ...this.editDeviceForm.value
      };

      this.deviceService.updateDevice(updatedData).subscribe({
        next: () => {
          this.successMessage = 'Device updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/dashboard/device-list']);
          }, 1500);
        },
        error: (err) => {
          console.error('Failed to update device', err);
          this.errorMessage = 'Failed to update device. Please try again.';
        }
      });
    }
  }
}