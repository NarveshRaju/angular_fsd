import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';
import { DoctorService, DoctorResponse } from '../services/doctor.service';
import { DepartmentService, DepartmentResponse } from '../services/department.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-book-appointment',
  standalone: false,
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  departments: DepartmentResponse[] = [];
  doctors: DoctorResponse[] = [];
  filteredDoctors: DoctorResponse[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  todayDate: string;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];

    this.appointmentForm = this.fb.group({
      departmentId: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDoctors();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (res: any) => this.departments = res.data || []
    });
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res.data || [];
        this.filteredDoctors = this.doctors;

        // Pre-select doctor if coming from doctor card
        const preselectedId = this.route.snapshot.queryParams['doctorId'];
        if (preselectedId) {
          const doc = this.doctors.find(d => d.id === +preselectedId);
          if (doc) {
            const dept = this.departments.find(dp => dp.name === doc.departmentName);
            if (dept) {
              this.appointmentForm.patchValue({ departmentId: dept.id, doctorId: doc.id });
              this.onDepartmentChange();
            }
          }
        }
      }
    });
  }

  onDepartmentChange(): void {
    const deptId = +this.appointmentForm.get('departmentId')?.value;
    if (deptId) {
      const dept = this.departments.find(d => d.id === deptId);
      this.filteredDoctors = this.doctors.filter(d => d.departmentName === dept?.name && d.isAvailable);
    } else {
      this.filteredDoctors = this.doctors;
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) return;

    const patientId = this.authService.getPatientId();
    if (!patientId) return;

    this.loading = true;
    this.errorMessage = '';

    const formData = {
      ...this.appointmentForm.value,
      patientId,
      departmentId: +this.appointmentForm.value.departmentId,
      doctorId: +this.appointmentForm.value.doctorId
    };

    this.appointmentService.bookAppointment(formData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Appointment booked successfully!';
        setTimeout(() => this.router.navigate(['/appointments/my']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to book appointment. Please try again.';
      }
    });
  }
}
