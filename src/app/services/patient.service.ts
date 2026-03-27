import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PatientResponse {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  bloodGroup: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatient(id: number): Observable<ApiResponse<PatientResponse>> {
    return this.http.get<ApiResponse<PatientResponse>>(`${this.apiUrl}/${id}`);
  }

  updatePatient(id: number, data: any): Observable<ApiResponse<PatientResponse>> {
    return this.http.put<ApiResponse<PatientResponse>>(`${this.apiUrl}/${id}`, data);
  }
}
