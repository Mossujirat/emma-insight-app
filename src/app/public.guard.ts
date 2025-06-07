import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isLoggedIn()) {
      console.log('PublicGuard: User already logged in. Redirecting to dashboard.');
      // User is logged in, redirect them to the dashboard
      return this.router.createUrlTree(['/dashboard']);
    } else {
      // User is not logged in, allow them to access public routes (login/register)
      return true;
    }
  }
}