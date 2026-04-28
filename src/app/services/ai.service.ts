import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PrescriptionAnalysis {
  imageId: number;
  status: string;
  extractedText: string;
  analyzedMedicines: string;
  confidenceScore: number;
  analyzedAt: string;
}

export interface PrescriptionAnswer {
  question: string;
  answer: string;
  askedAt: string;
}

export interface ChatMessage {
  question: string;
  answer: string;
  askedAt: string;
}

export interface ChatHistory {
  prescriptionImageId: number;
  chatHistory: ChatMessage[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai/prescriptions`;

  constructor(private http: HttpClient) {}

  uploadPrescriptionImage(prescriptionId: number, file: File): Observable<ApiResponse<PrescriptionAnalysis>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<PrescriptionAnalysis>>(
      `${this.apiUrl}/${prescriptionId}/upload-image`, formData
    );
  }

  getAnalysis(imageId: number): Observable<ApiResponse<PrescriptionAnalysis>> {
    return this.http.get<ApiResponse<PrescriptionAnalysis>>(
      `${this.apiUrl}/images/${imageId}/analysis`
    );
  }

  getImageDetails(imageId: number): Observable<ApiResponse<PrescriptionAnalysis>> {
    return this.http.get<ApiResponse<PrescriptionAnalysis>>(
      `${this.apiUrl}/images/${imageId}`
    );
  }

  askQuestion(imageId: number, question: string): Observable<ApiResponse<PrescriptionAnswer>> {
    return this.http.post<ApiResponse<PrescriptionAnswer>>(
      `${this.apiUrl}/images/${imageId}/ask`, { question }
    );
  }

  getChatHistory(imageId: number): Observable<ApiResponse<ChatHistory>> {
    return this.http.get<ApiResponse<ChatHistory>>(
      `${this.apiUrl}/images/${imageId}/chat-history`
    );
  }

  getMedicineInfo(name: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(
      `${this.apiUrl}/medicines/info`, { params: { name } }
    );
  }

  getPatientAnalyzedPrescriptions(patientId: number): Observable<ApiResponse<PrescriptionAnalysis[]>> {
    return this.http.get<ApiResponse<PrescriptionAnalysis[]>>(
      `${this.apiUrl}/patient/${patientId}/all-analyzed`
    );
  }
}
