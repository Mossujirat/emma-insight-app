import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component'; 
import { StatisticsComponent } from './statistics/statistics.component'; 
import { DriverDetailsComponent } from './driver-details/driver-details.component'; 
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { TripDetailsComponent } from './trip-details/trip-details.component';
import { StatDriverComponent } from './stat-driver/stat-driver.component';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [PublicGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [PublicGuard]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardComponent },
      { path: 'home/:id', component: DriverDetailsComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'statistics/:driverId', component: StatDriverComponent },
      { path: 'statistics/:driverId/:tripId', component: TripDetailsComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }