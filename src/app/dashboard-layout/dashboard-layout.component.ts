import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  currentTheme: 'light' | 'dark' = 'light'; // For the dashboard header theme switch

  constructor(
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2 // Inject Renderer2 for theme
  ) { }

  ngOnInit(): void {
    // Initialize theme for this component's header (can be separate or synced with app-wide)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.currentTheme = 'dark';
    } else {
      this.currentTheme = 'light';
    }
    // Also apply to body if not already handled by app-component
    this.applyThemeToBody();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    // Use replaceUrl: true to prevent going back to the dashboard via browser back button
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // Theme toggle for dashboard header - syncs with app-wide theme
  toggleTheme(): void {
    if (this.currentTheme === 'light') {
      this.currentTheme = 'dark';
    } else {
      this.currentTheme = 'light';
    }
    localStorage.setItem('theme', this.currentTheme);
    this.applyThemeToBody();
  }

  private applyThemeToBody(): void {
    if (this.currentTheme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
}