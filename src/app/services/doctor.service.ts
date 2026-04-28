import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialization: string;
  qualification: string;
  contactNumber: string;
  email: string;
  departmentName: string;
  experienceYears: number;
  consultationFee: number;
  isAvailable: boolean;
  isActive: boolean;
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
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  getAllDoctors(): Observable<ApiResponse<DoctorResponse[]>> {
    return this.http.get<ApiResponse<DoctorResponse[]>>(this.apiUrl);
  }

  getDoctorsByDepartment(deptId: number): Observable<ApiResponse<DoctorResponse[]>> {
    return this.http.get<ApiResponse<DoctorResponse[]>>(`${this.apiUrl}/department/${deptId}`);
  }

  getAvailableDoctors(): Observable<ApiResponse<DoctorResponse[]>> {
    return this.http.get<ApiResponse<DoctorResponse[]>>(`${this.apiUrl}/available`);
  }

  getDoctorById(id: number): Observable<ApiResponse<DoctorResponse>> {
    return this.http.get<ApiResponse<DoctorResponse>>(`${this.apiUrl}/${id}`);
  }

  updateAvailability(id: number, isAvailable: boolean): Observable<ApiResponse<DoctorResponse>> {
    return this.http.patch<ApiResponse<DoctorResponse>>(`${this.apiUrl}/${id}/availability?isAvailable=${isAvailable}`, {});
  }
}
