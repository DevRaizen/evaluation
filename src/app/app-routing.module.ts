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

const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' }, // Redirect to login on load
  { path: 'login', component: LoginComponent },
  { path: 'user', component: UserComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'manage-user', component: ManageUserComponent },
  { path: 'student-view', component: StudentViewComponent },
  { path: 'teacher-view', component: TeacherViewComponent },
   { path: 'subject-map', component: SubjectMapComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
