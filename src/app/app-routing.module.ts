import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component'; // Keep DashboardComponent
import { StatisticsComponent } from './statistics/statistics.component'; // Import StatisticsComponent (will create next)
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component'; // Import DashboardLayoutComponent
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent, // Now this is the parent layout
    canActivate: [AuthGuard],
    children: [ // Define child routes for the dashboard layout
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default child route
      { path: 'home', component: DashboardComponent }, // The actual dashboard home content
      { path: 'statistics', component: StatisticsComponent } // The statistics page (create this component next)
      // Add more child routes here as needed
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }