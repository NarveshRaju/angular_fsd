import { Component, OnInit } from '@angular/core';
import { AppointmentService, AppointmentResponse } from '../services/appointment.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-my-appointments',
  standalone: false,
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.css'
})
export class MyAppointmentsComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  loading = true;
  isDoctor = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isDoctor = this.authService.isDoctor();
    this.loadAppointments();
  }

  loadAppointments(): void {
    if (this.isDoctor) {
      const doctorId = this.authService.getDoctorId();
      if (!doctorId) return;

      this.appointmentService.getDoctorAppointments(doctorId).subscribe({
        next: (res: any) => {
          this.appointments = res.data || [];
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      const patientId = this.authService.getPatientId();
      if (!patientId) return;

      this.appointmentService.getMyAppointments(patientId).subscribe({
        next: (res: any) => {
          this.appointments = res.data || [];
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  cancelAppointment(id: number): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => {
        this.appointments = this.appointments.filter(a => a.id !== id);
      }
    });
  }

  completeAppointment(id: number): void {
    this.appointmentService.completeAppointment(id).subscribe({
      next: () => {
        const appt = this.appointments.find(a => a.id === id);
        if (appt) appt.status = 'COMPLETED';
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'COMPLETED': return 'badge-info';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-primary';
    }
  }
}
