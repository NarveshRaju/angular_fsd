import { Component, OnInit } from '@angular/core';
import { DoctorService, DoctorResponse } from '../services/doctor.service';
import { DepartmentService, DepartmentResponse } from '../services/department.service';

@Component({
  selector: 'app-doctors',
  standalone: false,
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit {
  doctors: DoctorResponse[] = [];
  filteredDoctors: DoctorResponse[] = [];
  departments: DepartmentResponse[] = [];
  selectedDepartment = 0;
  loading = true;

  constructor(
    private doctorService: DoctorService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.loadDepartments();
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res.data || [];
        this.filteredDoctors = this.doctors;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (res: any) => this.departments = res.data || []
    });
  }

  filterByDepartment(deptId: number): void {
    this.selectedDepartment = deptId;
    if (deptId === 0) {
      this.filteredDoctors = this.doctors;
    } else {
      const dept = this.departments.find(d => d.id === deptId);
      this.filteredDoctors = this.doctors.filter(d => d.departmentName === dept?.name);
    }
  }
}
