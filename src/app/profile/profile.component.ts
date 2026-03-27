import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService, PatientResponse } from '../services/patient.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  patient: PatientResponse | null = null;
  profileForm: FormGroup;
  editing = false;
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      gender: [''],
      contactNumber: ['', Validators.required],
      address: [''],
      bloodGroup: [''],
      allergies: [''],
      emergencyContactName: [''],
      emergencyContactNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) return;

    this.patientService.getPatient(patientId).subscribe({
      next: (res: any) => {
        this.patient = res.data;
        this.profileForm.patchValue({
          firstName: this.patient!.firstName,
          lastName: this.patient!.lastName,
          email: this.patient!.email,
          dateOfBirth: this.patient!.dateOfBirth,
          gender: this.patient!.gender,
          contactNumber: this.patient!.contactNumber,
          address: this.patient!.address,
          bloodGroup: this.patient!.bloodGroup,
          allergies: this.patient!.allergies,
          emergencyContactName: this.patient!.emergencyContactName,
          emergencyContactNumber: this.patient!.emergencyContactNumber
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSave(): void {
    if (this.profileForm.invalid) return;

    const patientId = this.authService.getPatientId();
    if (!patientId) return;

    this.saving = true;
    this.patientService.updatePatient(patientId, this.profileForm.value).subscribe({
      next: (res: any) => {
        this.patient = res.data;
        this.editing = false;
        this.saving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Failed to update profile.';
      }
    });
  }
}
