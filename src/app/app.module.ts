import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { BookAppointmentComponent } from './appointments/book-appointment.component';
import { MyAppointmentsComponent } from './appointments/my-appointments.component';
import { ProfileComponent } from './profile/profile.component';
import { AiPrescriptionComponent } from './ai-prescription/ai-prescription.component';
import { MedicineLookupComponent } from './medicine-lookup/medicine-lookup.component';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'doctors',
    component: DoctorsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'appointments/book',
    component: BookAppointmentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'appointments/my',
    component: MyAppointmentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ai-prescription',
    component: AiPrescriptionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'medicine-lookup',
    component: MedicineLookupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'medical-history',
    component: MedicalHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DoctorsComponent,
    BookAppointmentComponent,
    MyAppointmentsComponent,
    ProfileComponent,
    AiPrescriptionComponent,
    MedicineLookupComponent,
    MedicalHistoryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    CoreModule
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
