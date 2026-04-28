import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
export class MedicalHistoryService {
  private apiUrl = `${environment.apiUrl}/medical-history`;

  constructor(private http: HttpClient) {}

  getPatientHistory(patientId: number): Observable<ApiResponse<MedicalHistoryResponse[]>> {
    return this.http.get<ApiResponse<MedicalHistoryResponse[]>>(
      `${this.apiUrl}/patient/${patientId}`
    );
  }

  getRecentHistory(patientId: number): Observable<ApiResponse<MedicalHistoryResponse[]>> {
    return this.http.get<ApiResponse<MedicalHistoryResponse[]>>(
      `${this.apiUrl}/patient/${patientId}/recent`
    );
  }

  getHistoryById(id: number): Observable<ApiResponse<MedicalHistoryResponse>> {
    return this.http.get<ApiResponse<MedicalHistoryResponse>>(
      `${this.apiUrl}/${id}`
    );
  }

  searchByDiagnosis(diagnosis: string): Observable<ApiResponse<MedicalHistoryResponse[]>> {
    return this.http.get<ApiResponse<MedicalHistoryResponse[]>>(
      `${this.apiUrl}/search`, { params: { diagnosis } }
    );
  }
}
