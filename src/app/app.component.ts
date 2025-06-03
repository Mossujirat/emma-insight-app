import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'my-auth-app';
  isPublicPage: boolean = true; // Default to true, as landing is usually the first page
  private unsubscribe$ = new Subject<void>();

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Subscribe to router events to determine if the current route is a public page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.unsubscribe$)
    ).subscribe((event: NavigationEnd) => {
      // Check if the current URL starts with '/dashboard'
      // If it does, it's a protected page, so hide the public header
      this.isPublicPage = !event.urlAfterRedirects.startsWith('/dashboard');
      console.log('Is public page:', this.isPublicPage, 'Current URL:', event.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}