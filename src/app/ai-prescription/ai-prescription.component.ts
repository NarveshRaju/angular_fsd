import { Component, OnInit } from '@angular/core';
import { AiService, PrescriptionAnalysis, ChatMessage } from '../services/ai.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ai-prescription',
  standalone: false,
  templateUrl: './ai-prescription.component.html',
  styleUrl: './ai-prescription.component.css'
})
export class AiPrescriptionComponent implements OnInit {
  // Upload state
  selectedFile: File | null = null;
  uploading = false;
  dragOver = false;
  prescriptionIdInput = '';

  // Analysis state
  currentAnalysis: PrescriptionAnalysis | null = null;
  analysisError = '';

  // Chat state
  chatMessages: ChatMessage[] = [];
  currentQuestion = '';
  askingQuestion = false;

  // History
  pastAnalyses: PrescriptionAnalysis[] = [];
  loadingHistory = true;

  constructor(
    private aiService: AiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPastAnalyses();
  }

  loadPastAnalyses(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) return;

    this.aiService.getPatientAnalyzedPrescriptions(patientId).subscribe({
      next: (res: any) => {
        this.pastAnalyses = res.data || [];
        this.loadingHistory = false;
      },
      error: () => this.loadingHistory = false
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadPrescription(): void {
    if (!this.selectedFile || !this.prescriptionIdInput) return;

    this.uploading = true;
    this.analysisError = '';
    this.currentAnalysis = null;

    const prescriptionId = parseInt(this.prescriptionIdInput, 10);

    this.aiService.uploadPrescriptionImage(prescriptionId, this.selectedFile).subscribe({
      next: (res: any) => {
        this.currentAnalysis = res.data;
        this.uploading = false;
        this.chatMessages = [];
        this.loadPastAnalyses();
      },
      error: (err: any) => {
        this.uploading = false;
        this.analysisError = err?.error?.message || 'Failed to analyze prescription. Please try again.';
      }
    });
  }

  viewAnalysis(analysis: PrescriptionAnalysis): void {
    this.currentAnalysis = analysis;
    this.chatMessages = [];
    this.loadChatHistory(analysis.imageId);
  }

  loadChatHistory(imageId: number): void {
    this.aiService.getChatHistory(imageId).subscribe({
      next: (res: any) => {
        this.chatMessages = res.data?.chatHistory || [];
      }
    });
  }

  askQuestion(): void {
    if (!this.currentQuestion.trim() || !this.currentAnalysis) return;

    this.askingQuestion = true;
    const question = this.currentQuestion;
    this.currentQuestion = '';

    this.aiService.askQuestion(this.currentAnalysis.imageId, question).subscribe({
      next: (res: any) => {
        this.chatMessages.push({
          question: res.data.question,
          answer: res.data.answer,
          askedAt: res.data.askedAt
        });
        this.askingQuestion = false;
      },
      error: () => {
        this.askingQuestion = false;
        this.chatMessages.push({
          question,
          answer: 'Sorry, I could not process your question. Please try again.',
          askedAt: new Date().toISOString()
        });
      }
    });
  }

  getConfidenceClass(score: number): string {
    if (score >= 0.8) return 'confidence-high';
    if (score >= 0.5) return 'confidence-medium';
    return 'confidence-low';
  }

  getConfidencePercent(score: number): number {
    return Math.round(score * 100);
  }

  clearAnalysis(): void {
    this.currentAnalysis = null;
    this.chatMessages = [];
    this.selectedFile = null;
    this.prescriptionIdInput = '';
    this.analysisError = '';
  }
}
