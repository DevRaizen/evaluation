import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';

const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' }, // Redirect to login on load
  { path: 'login', component: LoginComponent },
  { path: 'user', component: UserComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verification', component: VerificationComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
