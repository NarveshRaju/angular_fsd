import { Component, OnInit } from '@angular/core';
import { PatientService, PatientResponse } from '../services/patient.service';
import { AppointmentService, AppointmentResponse } from '../services/appointment.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  patient: PatientResponse | null = null;
  upcomingAppointments: AppointmentResponse[] = [];
  loading = true;

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.patientService.getPatient(patientId).subscribe({
      next: (res: any) => {
        this.patient = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.appointmentService.getMyAppointments(patientId).subscribe({
      next: (res: any) => {
        this.upcomingAppointments = (res.data || [])
          .filter((a: any) => a.status !== 'CANCELLED')
          .slice(0, 5);
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
