import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core'; // Add OnDestroy
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'; // Import Router, ActivatedRoute, NavigationEnd
import { filter } from 'rxjs/operators'; // Import filter operator
import { Subject } from 'rxjs'; // Import Subject for OnDestroy
import { takeUntil } from 'rxjs/operators'; // Import takeUntil

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy { // Implement OnDestroy
  currentTheme: 'light' | 'dark' = 'light';
  activePage: string = ''; // New property to store the active page (e.g., 'login', 'register', 'home')
  private unsubscribe$ = new Subject<void>(); // Used to unsubscribe from observables

  constructor(
    private renderer: Renderer2,
    private router: Router, // Inject Router
    private activatedRoute: ActivatedRoute // Inject ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Theme initialization (keep existing logic)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.currentTheme = 'dark';
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.currentTheme = 'light';
      this.renderer.removeClass(document.body, 'dark-theme');
    }

    // Subscribe to router events to determine active page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.unsubscribe$) // Unsubscribe when component is destroyed
    ).subscribe((event: NavigationEnd) => {
      // Extract the primary URL segment
      const urlSegments = event.urlAfterRedirects.split('/');
      this.activePage = urlSegments.length > 1 ? urlSegments[1] : ''; // Get the first segment after root
      if (this.activePage === '') { // If it's the root URL, consider it 'home' or similar
        this.activePage = 'home';
      }
      console.log('Active page:', this.activePage); // For debugging
    });
  }

  toggleTheme(): void {
    // ... (keep existing logic) ...
    if (this.currentTheme === 'light') {
      this.currentTheme = 'dark';
      this.renderer.addClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      this.currentTheme = 'light';
      this.renderer.removeClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}