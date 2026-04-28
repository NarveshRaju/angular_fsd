import { Component, OnInit } from '@angular/core';
import { MedicalHistoryService, MedicalHistoryResponse } from '../services/medical-history.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-medical-history',
  standalone: false,
  templateUrl: './medical-history.component.html',
  styleUrl: './medical-history.component.css'
})
export class MedicalHistoryComponent implements OnInit {
  history: MedicalHistoryResponse[] = [];
  loading = true;
  expandedId: number | null = null;
  searchQuery = '';

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) return;

    this.medicalHistoryService.getPatientHistory(patientId).subscribe({
      next: (res: any) => {
        this.history = res.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  searchByDiagnosis(): void {
    if (!this.searchQuery.trim()) {
      this.loadHistory();
      return;
    }

    this.loading = true;
    this.medicalHistoryService.searchByDiagnosis(this.searchQuery.trim()).subscribe({
      next: (res: any) => {
        this.history = res.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleExpand(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getVitalStatus(bp: string): string {
    if (!bp) return '';
    const systolic = parseInt(bp.split('/')[0], 10);
    if (systolic < 120) return 'vital-normal';
    if (systolic < 140) return 'vital-warning';
    return 'vital-danger';
  }
}
