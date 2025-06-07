import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // We'll just declare this for future use, not actively use it yet
import { Observable, of, throwError } from 'rxjs'; // Import Observable, of, throwError
import { delay, tap } from 'rxjs/operators'; // Import delay and tap
import { LoginCredentials, RegistrationData, User } from './models/user.model'; // Import the new interfaces

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_PROFILE_KEY = 'userProfile';

  // We are not actively using HttpClient yet, but it's good to have it ready for a real backend
  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<any> {
    console.log('AuthService: Attempting login with:', credentials);
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      return of({ message: 'Login successful' }).pipe(
        delay(1000), // Simulate network latency
        tap(() => {
          const fakeToken = 'fake-jwt-token-12345';
          const fakeUserId = 'fake-id-1234';
          const fakeUser: User = {
            userId: fakeUserId,
            username: 'Chadchai', // The name you want to display
            email: credentials.email,
            password: credentials.password,
            token: fakeToken,
          };
          this.setToken(fakeToken);
          this.setUserProfile(fakeUser);
          console.log('AuthService: Login successful!'); // This will now log on success
        })
      );
    } else {
      // If credentials are bad, immediately return an observable that throws an error after a delay
      return throwError(() => new Error('Invalid email or password')).pipe(
        delay(1000) // Simulate network latency for failed login too
      );
    }
  }

  register(userData: any): Observable<any> {
    console.log('AuthService: Attempting registration with:', userData);
    // Simulate API call with a delay
    return of(null).pipe(
      delay(1500), // Simulate network latency
      tap(() => {
        // Simulate a simple registration success/failure
        // For demonstration, let's say registration is always successful
        console.log('AuthService: Registration successful!');
        // In a real app, you might auto-login or redirect to login after registration
      })
      // You could add throwError here for simulated registration failures (e.g., username taken)
    );
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUserProfile(user: User): void {
    localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserProfile(): User | null {
    const userProfileString = localStorage.getItem(this.USER_PROFILE_KEY);
    if (userProfileString) {
      try {
        return JSON.parse(userProfileString) as User; // Cast to User interface
      } catch (e) {
        console.error("Error parsing user profile from localStorage", e);
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken(); // Convert to boolean: true if token exists, false if null
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_PROFILE_KEY);
    console.log('AuthService: User logged out.');
  }
}