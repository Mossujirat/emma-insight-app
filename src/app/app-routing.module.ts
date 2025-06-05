import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component'; // Dashboard Home (overview)
import { StatisticsComponent } from './statistics/statistics.component'; // New Overall Statistics Page
import { DriverDetailsComponent } from './driver-details/driver-details.component'; // New Driver Details Page
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardComponent }, // Main dashboard overview
      { path: 'statistics', component: StatisticsComponent }, // New overall statistics page
      { path: 'driver-details/:id', component: DriverDetailsComponent } // New route for driver details with a parameter
      // If you prefer query parameters for driver details:
      // { path: 'driver-details', component: DriverDetailsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }