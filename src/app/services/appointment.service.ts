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

export interface AppointmentResponse {
  id: number;
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

  cancelAppointment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getTodayAppointments(): Observable<ApiResponse<AppointmentResponse[]>> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(`${this.apiUrl}/today`);
  }
}
