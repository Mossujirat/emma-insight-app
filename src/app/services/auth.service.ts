import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // We'll just declare this for future use, not actively use it yet
import { Observable, of, throwError } from 'rxjs'; // Import Observable, of, throwError
import { delay, tap, map, catchError } from 'rxjs/operators'; // Import delay and tap
import { LoginCredentials, RegistrationData, User} from '../models/user.model'; // Import the new interfaces

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_PROFILE_KEY = 'userProfile';
  private apiUrl = 'http://localhost:3001';

  // We are not actively using HttpClient yet, but it's good to have it ready for a real backend
  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<any> {
    console.log('AuthService: Sending login request to Mockoon backend:', credentials);
    // Ensure the endpoint matches your Mockoon setup (e.g., /userlogin or /login)
    return this.http.post<any>(`${this.apiUrl}/userlogin`, credentials).pipe(
      // Use map to transform the Mockoon response structure to what your service expects
      map((response : any) => {
        // Map Mockoon's flat response to your { token: '...', user: { ... } } structure
        const user: User = {
          userId: response.userId,
          username: response.username,
          email: response.userEmail,
        };
        return { token: response.token, user: user };
      }),
      tap(transformedResponse => { // Now tap on the transformed response
        console.log(transformedResponse.token)
        if (transformedResponse.token && transformedResponse.user) {
          this.setToken(transformedResponse.token);
          this.setUserProfile(transformedResponse.user as User);
          console.log('AuthService: Login successful! Token and user stored from Mockoon.');
        } else {
          console.error('AuthService: Login response from Mockoon missing token or user data.');
          throw new Error('Login failed: Invalid Mockoon server response.');
        }
      }),
      catchError(error => {
        let errorMessage = 'An unknown error occurred during login.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Use Mockoon's specific error message
        } else if (error.status === 401) { // Specifically handle 401 from Mockoon
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        console.error('AuthService: Login failed with error from Mockoon:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // In AuthService, modify register's tap and add return type
  register(userData: RegistrationData): Observable<any> { // Updated return type
    console.log('AuthService: Sending registration request to backend:', userData);
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        console.log('AuthService: Registration successful! Response:', response);
        // Auto-login: Store token and user profile
        if (response.user.token && response.user) {
          this.setToken(response.user.token);
          this.setUserProfile(response.user as User);
          console.log('AuthService: User auto-logged in after registration.');
        }
      }),
      catchError(error => {
        let errorMessage = 'An unknown error occurred during registration.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 409) {
          errorMessage = 'Email or username already exists. Please choose another.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        console.error('AuthService: Registration failed with error from Mockoon:', error);
        return throwError(() => new Error(errorMessage));
      })
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