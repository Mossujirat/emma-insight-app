import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms'; // Import necessary modules
import { AuthService } from '../services/auth.service'; // Import AuthService
import { Router } from '@angular/router'; // Import Router

// Custom validator function for password matching
export function passwordMatchValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: any } | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // Set error on matchingControl if validation fails
    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Inject AuthService
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword') // Add custom validator at FormGroup level
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        // console.log('Registration successful!');
        this.successMessage = 'Registration successful! You can now log in.';
        this.registerForm.reset(); // Clear the form
        console.log('Registration successful! Auto-logging in...');
        // No need for a success message on the page if immediately redirected
        // this.router.navigate(['/dashboard']); // Redirect directly to dashboard
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.errorMessage = 'Registration failed. Please try again.'; // Set a generic error message
        // In a real app, you'd get specific error messages from the backend (e.g., username/email already taken)
      }
    });
  }
}