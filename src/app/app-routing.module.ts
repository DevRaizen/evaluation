import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { StudentViewComponent } from './student-view/student-view.component';
import { TeacherViewComponent } from './teacher-view/teacher-view.component';
import { SubjectMapComponent } from './subject-map/subject-map.component';
import { EvalFormComponent } from './eval-form/eval-form.component';
import { EvalScedComponent } from './eval-sced/eval-sced.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { GenReportComponent } from './gen-report/gen-report.component';
import { SettingsComponent } from './settings/settings.component';
import { TdashboardComponent } from './tdashboard/tdashboard.component';
import { TsubjectMapComponent } from './tsubject-map/tsubject-map.component';
import { TsettingsComponent } from './tsettings/tsettings.component';
import { StdashboardComponent } from './stdashboard/stdashboard.component';
import { StevalFormComponent } from './steval-form/steval-form.component';
import { ViewTeacherReportComponent } from './view-teacher-report/view-teacher-report.component';
import { PdashboardComponent } from './pdashboard/pdashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirect to login on load
  { path: 'login', component: LoginComponent },
  { path: 'user', component: UserComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'manage-user', component: ManageUserComponent },
  { path: 'student-view', component: StudentViewComponent },
  { path: 'teacher-view', component: TeacherViewComponent },
  { path: 'subject-map', component: SubjectMapComponent },
  { path: 'eval-form', component: EvalFormComponent },
  { path: 'eval-sced', component: EvalScedComponent },
  { path: 'calendar-view', component: CalendarViewComponent },
  { path: 'gen-report', component: GenReportComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'tdashboard', component: TdashboardComponent},
  { path: 'tsubject-map', component: TsubjectMapComponent},
  { path: 'tsettings', component: TsettingsComponent},
  { path: 'stdashboard', component: StdashboardComponent},
  { path: 'steval-form', component: StevalFormComponent},
  { path: 'view-teacher-report', component: ViewTeacherReportComponent},
  { path: 'pdashboard', component:PdashboardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
