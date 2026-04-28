import { Component } from '@angular/core';
import { AiService } from '../services/ai.service';

@Component({
  selector: 'app-medicine-lookup',
  standalone: false,
  templateUrl: './medicine-lookup.component.html',
  styleUrl: './medicine-lookup.component.css'
})
export class MedicineLookupComponent {
  medicineName = '';
  medicineInfo = '';
  loading = false;
  errorMessage = '';
  searchHistory: { name: string; info: string }[] = [];

  constructor(private aiService: AiService) {}

  searchMedicine(): void {
    if (!this.medicineName.trim()) return;

    this.loading = true;
    this.errorMessage = '';
    this.medicineInfo = '';

    this.aiService.getMedicineInfo(this.medicineName.trim()).subscribe({
      next: (res: any) => {
        this.medicineInfo = res.data || 'No information found.';
        this.searchHistory.unshift({
          name: this.medicineName.trim(),
          info: this.medicineInfo
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to fetch medicine information. Please try again.';
      }
    });
  }

  loadFromHistory(item: { name: string; info: string }): void {
    this.medicineName = item.name;
    this.medicineInfo = item.info;
  }

  clearSearch(): void {
    this.medicineName = '';
    this.medicineInfo = '';
    this.errorMessage = '';
  }
}
