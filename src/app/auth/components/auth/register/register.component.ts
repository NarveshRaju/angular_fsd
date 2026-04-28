import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  patientForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading = false;

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  genders = ['Male', 'Female', 'Other'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      bloodGroup: [''],
      allergies: [''],
      emergencyContactName: [''],
      emergencyContactNumber: ['']
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.patientForm.value).subscribe({
      next: () => {
        this.loading = false;
        const { email, password } = this.patientForm.value;
        this.authService.login({ email, password }).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => {
            this.successMessage = 'Account created successfully! Redirecting to login...';
            setTimeout(() => this.router.navigate(['/auth/login']), 1500);
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err?.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check your connection.';
        } else if (err?.status === 409) {
          this.errorMessage = 'An account with this email already exists.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
