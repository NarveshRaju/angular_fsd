import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppointmentRequest {
  patientId: number;
  doctorId: number;
  departmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes: string;
}

export interface ConsultationRequest {
  symptoms: string;
  diagnosis: string;
  treatment: string;
  bloodPressure?: string;
  temperature?: number;
  pulse?: number;
  weight?: number;
  height?: number;
  medicines: string;
  instructions?: string;
  followUpInstructions?: string;
  followUpDate?: string;
  notes?: string;
}

export interface FeedbackRequest {
  rating: number;
  comment?: string;
}

export interface AppointmentResponse {
  id: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  reason: string;
  notes: string;
  createdAt: string;
  // Consultation data
  diagnosis: string;
  medicines: string;
  consultationNotes: string;
  // Feedback
  rating: number;
  feedbackComment: string;
}

export interface MedicalHistoryResponse {
  id: number;
  patientName: string;
  doctorName: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  bloodPressure: string;
  temperature: number;
  pulse: number;
  weight: number;
  height: number;
  notes: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  bookAppointment(data: AppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.post<ApiResponse<AppointmentResponse>>(this.apiUrl, data);
  }

  getMyAppointments(patientId: number): Observable<ApiResponse<AppointmentResponse[]>> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(`${this.apiUrl}/patient/${patientId}`);
  }

  getDoctorAppointments(doctorId: number): Observable<ApiResponse<AppointmentResponse[]>> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  cancelAppointment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getTodayAppointments(): Observable<ApiResponse<AppointmentResponse[]>> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(`${this.apiUrl}/today`);
  }

  // NEW: Start appointment (SCHEDULED → IN_PROGRESS)
  startAppointment(id: number): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.put<ApiResponse<AppointmentResponse>>(`${this.apiUrl}/${id}/start`, {});
  }

  // NEW: Complete with full consultation
  completeWithConsultation(id: number, data: ConsultationRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.put<ApiResponse<AppointmentResponse>>(`${this.apiUrl}/${id}/complete-consultation`, data);
  }

  // Legacy: Simple complete
  completeAppointment(id: number): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.put<ApiResponse<AppointmentResponse>>(`${this.apiUrl}/${id}/complete`, {});
  }

  // NEW: Submit patient feedback
  submitFeedback(id: number, data: FeedbackRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.post<ApiResponse<AppointmentResponse>>(`${this.apiUrl}/${id}/feedback`, data);
  }

  // NEW: Get patient history for doctor during consultation
  getPatientHistory(appointmentId: number): Observable<ApiResponse<MedicalHistoryResponse[]>> {
    return this.http.get<ApiResponse<MedicalHistoryResponse[]>>(`${this.apiUrl}/${appointmentId}/patient-history`);
  }
}
