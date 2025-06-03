import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service'; // Import AuthService
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import FormBuilder, FormGroup, Validators
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Declare loginForm as a FormGroup
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Inject AuthService
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // 'email' control with required and email validators
      password: ['', [Validators.required, Validators.minLength(6)]] // 'password' control with required and minLength(6) validators
    });
  }

  // Getter for easy access to form fields in the template
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.errorMessage = ''; // Clear previous error messages
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        console.log('Login success! Redirecting to a dashboard/home page (not yet created)');
        this.router.navigate(['/dashboard']); // Redirect to a protected dashboard route (create this later)
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid email or password. Please try again.'; // Set error message
      }
    });
  }
}