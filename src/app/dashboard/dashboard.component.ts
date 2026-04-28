import { Component, OnInit, OnDestroy } from '@angular/core';
import { PatientService, PatientResponse } from '../services/patient.service';
import { AppointmentService, AppointmentResponse, ConsultationRequest, MedicalHistoryResponse } from '../services/appointment.service';
import { MedicalHistoryService, MedicalHistoryResponse as MHResponse } from '../services/medical-history.service';
import { DoctorService, DoctorResponse } from '../services/doctor.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Shared
  role = 'PATIENT';
  loading = true;
  userName = '';
  private refreshInterval: any;

  // Patient-specific
  patient: PatientResponse | null = null;
  upcomingAppointments: AppointmentResponse[] = [];
  recentHistory: MHResponse[] = [];

  // AI Symptom Checker
  symptomText = '';
  symptomResult = '';
  symptomLoading = false;
  showSymptomChecker = false;

  // Patient feedback
  feedbackApptId: number | null = null;
  feedbackRating = 0;
  feedbackComment = '';
  feedbackLoading = false;
  feedbackSuccess = '';

  // Doctor-specific
  doctor: DoctorResponse | null = null;
  doctorAppointments: AppointmentResponse[] = [];
  todayCount = 0;
  scheduledCount = 0;
  completedCount = 0;
  totalPatients = 0;

  // Consultation modal
  showConsultModal = false;
  consultAppt: AppointmentResponse | null = null;
  patientHistory: MedicalHistoryResponse[] = [];
  consultForm: ConsultationRequest = this.getEmptyConsultForm();
  consultLoading = false;
  consultError = '';
  consultSuccess = '';

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private medicalHistoryService: MedicalHistoryService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    if (this.role === 'DOCTOR') {
      this.loadDoctorDashboard();
    } else {
      this.loadPatientDashboard();
    }
    this.refreshInterval = setInterval(() => {
      if (this.role === 'DOCTOR') this.refreshDoctorAppointments();
      else this.refreshPatientAppointments();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  // ========== PATIENT DASHBOARD ==========
  private loadPatientDashboard(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) { this.router.navigate(['/auth/login']); return; }

    this.patientService.getPatient(patientId).subscribe({
      next: (res: any) => { this.patient = res.data; this.userName = res.data?.firstName || 'Patient'; this.loading = false; },
      error: () => this.loading = false
    });
    this.refreshPatientAppointments();
    this.medicalHistoryService.getRecentHistory(patientId).subscribe({
      next: (res: any) => { this.recentHistory = (res.data || []).slice(0, 3); }
    });
  }

  private refreshPatientAppointments(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) return;
    this.appointmentService.getMyAppointments(patientId).subscribe({
      next: (res: any) => {
        this.upcomingAppointments = (res.data || [])
          .filter((a: any) => a.status !== 'CANCELLED')
          .sort((a: any, b: any) => b.appointmentDate.localeCompare(a.appointmentDate))
          .slice(0, 6);
      }
    });
  }

  // AI Symptom Checker
  toggleSymptomChecker(): void {
    this.showSymptomChecker = !this.showSymptomChecker;
    this.symptomResult = '';
    this.symptomText = '';
  }

  checkSymptoms(): void {
    if (!this.symptomText.trim()) return;
    this.symptomLoading = true;
    this.symptomResult = '';
    this.http.post<any>(`${environment.apiUrl}/ai/symptom-check`, { symptoms: this.symptomText }).subscribe({
      next: (res: any) => { this.symptomResult = res.data || res.message; this.symptomLoading = false; },
      error: (err: any) => { this.symptomResult = 'Unable to analyze symptoms. Please try again.'; this.symptomLoading = false; }
    });
  }

  // Patient Feedback
  openFeedback(appt: AppointmentResponse): void {
    this.feedbackApptId = appt.id;
    this.feedbackRating = 0;
    this.feedbackComment = '';
    this.feedbackSuccess = '';
  }

  closeFeedback(): void {
    this.feedbackApptId = null;
  }

  setRating(star: number): void {
    this.feedbackRating = star;
  }

  submitFeedback(): void {
    if (!this.feedbackApptId || this.feedbackRating < 1) return;
    this.feedbackLoading = true;
    this.appointmentService.submitFeedback(this.feedbackApptId, {
      rating: this.feedbackRating,
      comment: this.feedbackComment
    }).subscribe({
      next: () => {
        this.feedbackLoading = false;
        this.feedbackSuccess = 'Thank you for your feedback!';
        const appt = this.upcomingAppointments.find(a => a.id === this.feedbackApptId);
        if (appt) { appt.rating = this.feedbackRating; appt.feedbackComment = this.feedbackComment; }
        setTimeout(() => this.closeFeedback(), 1500);
      },
      error: () => { this.feedbackLoading = false; }
    });
  }

  // ========== DOCTOR DASHBOARD ==========
  private loadDoctorDashboard(): void {
    const doctorId = this.authService.getDoctorId();
    if (!doctorId) { this.router.navigate(['/auth/login']); return; }

    this.doctorService.getDoctorById(doctorId).subscribe({
      next: (res: any) => { this.doctor = res.data; this.userName = res.data?.firstName || 'Doctor'; this.loading = false; },
      error: () => { this.userName = 'Doctor'; this.loading = false; }
    });
    this.refreshDoctorAppointments();
  }

  private refreshDoctorAppointments(): void {
    const doctorId = this.authService.getDoctorId();
    if (!doctorId) return;
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (res: any) => {
        const all: AppointmentResponse[] = res.data || [];
        this.doctorAppointments = all;
        const today = new Date().toISOString().split('T')[0];
        this.todayCount = all.filter(a => a.appointmentDate === today).length;
        this.scheduledCount = all.filter(a => a.status === 'SCHEDULED' || a.status === 'PENDING' || a.status === 'IN_PROGRESS').length;
        this.completedCount = all.filter(a => a.status === 'COMPLETED').length;
        const uniquePatients = new Set(all.map(a => a.patientName));
        this.totalPatients = uniquePatients.size;
      }
    });
  }

  toggleAvailability(): void {
    if (!this.doctor) return;
    const doctorId = this.authService.getDoctorId();
    if (!doctorId) return;
    this.doctorService.updateAvailability(doctorId, !this.doctor.isAvailable).subscribe({
      next: (res: any) => { if (this.doctor) this.doctor.isAvailable = res.data.isAvailable; }
    });
  }

  // Start appointment (SCHEDULED → IN_PROGRESS)
  startAppointment(appt: AppointmentResponse): void {
    this.appointmentService.startAppointment(appt.id).subscribe({
      next: () => {
        appt.status = 'IN_PROGRESS';
        this.scheduledCount--;
      }
    });
  }

  // Open consultation modal
  openConsultation(appt: AppointmentResponse): void {
    this.consultAppt = appt;
    this.consultForm = this.getEmptyConsultForm();
    this.consultForm.symptoms = appt.reason || '';
    this.consultError = '';
    this.consultSuccess = '';
    this.patientHistory = [];
    this.showConsultModal = true;

    // Load patient's past history
    this.appointmentService.getPatientHistory(appt.id).subscribe({
      next: (res: any) => { this.patientHistory = res.data || []; },
      error: () => {}
    });
  }

  closeConsultation(): void {
    this.showConsultModal = false;
    this.consultAppt = null;
  }

  submitConsultation(): void {
    if (!this.consultAppt || !this.consultForm.diagnosis) {
      this.consultError = 'Diagnosis is required';
      return;
    }
    this.consultLoading = true;
    this.consultError = '';
    this.appointmentService.completeWithConsultation(this.consultAppt.id, this.consultForm).subscribe({
      next: () => {
        this.consultLoading = false;
        this.consultSuccess = 'Consultation completed successfully!';
        if (this.consultAppt) {
          this.consultAppt.status = 'COMPLETED';
          this.consultAppt.diagnosis = this.consultForm.diagnosis;
          this.consultAppt.medicines = this.consultForm.medicines;
        }
        this.scheduledCount--;
        this.completedCount++;
        setTimeout(() => this.closeConsultation(), 1500);
        this.refreshDoctorAppointments();
      },
      error: (err: any) => {
        this.consultLoading = false;
        this.consultError = err?.error?.message || 'Failed to complete consultation';
      }
    });
  }

  private getEmptyConsultForm(): ConsultationRequest {
    return {
      symptoms: '', diagnosis: '', treatment: '',
      bloodPressure: '', temperature: undefined, pulse: undefined,
      weight: undefined, height: undefined,
      medicines: '', instructions: '', followUpInstructions: '',
      followUpDate: '', notes: ''
    };
  }

  // ========== SHARED ==========
  getGreeting(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  }

  isDoctor(): boolean { return this.role === 'DOCTOR'; }

  getUpcomingDoctorAppointments(): AppointmentResponse[] {
    const today = new Date().toISOString().split('T')[0];
    return this.doctorAppointments
      .filter(a => a.appointmentDate >= today && a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
      .slice(0, 10);
  }

  getCompletedAppointments(): AppointmentResponse[] {
    return this.doctorAppointments
      .filter(a => a.status === 'COMPLETED')
      .slice(0, 5);
  }

  getCompletedPatientAppointments(): AppointmentResponse[] {
    return this.upcomingAppointments.filter(a => a.status === 'COMPLETED');
  }

  getStarArray(): number[] { return [1, 2, 3, 4, 5]; }
}
