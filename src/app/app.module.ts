import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LandingComponent } from './landing/landing.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { LongdoMapComponent } from './longdo-map/longdo-map.component';
import { DriverDetailsComponent } from './driver-details/driver-details.component';
import { StatDriverComponent } from './stat-driver/stat-driver.component';
import { FormatSecondsPipe } from './pipes/format-seconds.pipe';
import { TripDetailsComponent } from './trip-details/trip-details.component';
import { UserDeviceListComponent } from './user-device-list/user-device-list.component';
import { AddDeviceComponent } from './add-device/add-device.component';
import { EditDeviceComponent } from './edit-device/edit-device.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    LandingComponent,
    HeaderComponent,
    DashboardComponent,
    DashboardLayoutComponent,
    StatisticsComponent,
    LongdoMapComponent,
    DriverDetailsComponent,
    StatDriverComponent,
    TripDetailsComponent,
    UserDeviceListComponent,
    AddDeviceComponent,
    EditDeviceComponent
    // The pipe is no longer declared here
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    FormatSecondsPipe // <-- Import the standalone pipe here
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }