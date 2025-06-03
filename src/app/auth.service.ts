import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // We'll just declare this for future use, not actively use it yet
import { Observable, of, throwError } from 'rxjs'; // Import Observable, of, throwError
import { delay, tap } from 'rxjs/operators'; // Import delay and tap

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken'; // Key for storing token in localStorage

  // We are not actively using HttpClient yet, but it's good to have it ready for a real backend
  constructor(private http: HttpClient) { }

  /**
   * Simulates a user login API call.
   * In a real app, this would send credentials to a backend and receive a token.
   * @param credentials An object containing email/username and password.
   * @returns An Observable that emits a success or error.
   */
  login(credentials: any): Observable<any> {
    console.log('AuthService: Attempting login with:', credentials);
    // Simulate API call with a delay
    return of(null).pipe(
      delay(1000), // Simulate network latency
      tap(() => {
        // Simple validation: If email is 'test@example.com' and password is 'password123', consider it successful
        if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
          const fakeToken = 'fake-jwt-token-12345'; // Simulate receiving a JWT token
          this.setToken(fakeToken);
          console.log('AuthService: Login successful!');
          // In a real app, you might also store user roles or other info
        } else {
          throwError(() => new Error('Invalid email or password')); // Simulate login failure
        }
      })
    );
  }

  /**
   * Simulates a user registration API call.
   * In a real app, this would send user details to a backend to create an account.
   * @param userData An object containing user registration details.
   * @returns An Observable that emits a success or error.
   */
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

  /**
   * Stores the authentication token in localStorage.
   * @param token The JWT token received from the backend.
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Retrieves the authentication token from localStorage.
   * @returns The stored token, or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Checks if a user is currently logged in based on the presence of a token.
   * In a real app, you might also validate the token (e.g., check expiration).
   * @returns True if a token exists, false otherwise.
   */
  isLoggedIn(): boolean {
    return !!this.getToken(); // Convert to boolean: true if token exists, false if null
  }

  /**
   * Logs out the user by removing the token from localStorage.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    console.log('AuthService: User logged out.');
  }
}