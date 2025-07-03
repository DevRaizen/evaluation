import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { UserComponent } from './user/user.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgChartsModule } from 'ng2-charts';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { StudentViewComponent } from './student-view/student-view.component';
import { TeacherViewComponent } from './teacher-view/teacher-view.component';
import { SubjectMapComponent } from './subject-map/subject-map.component';
import { EvalFormComponent } from './eval-form/eval-form.component';
import { EvalScedComponent } from './eval-sced/eval-sced.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { GenReportComponent } from './gen-report/gen-report.component';
import { SettingsComponent } from './settings/settings.component';
import { TdashboardComponent } from './tdashboard/tdashboard.component';
import { TsubjectMapComponent } from './tsubject-map/tsubject-map.component';

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    LoginComponent,
    DashboardComponent,
    RegisterComponent,
    VerificationComponent,
    ManageUserComponent,
    StudentViewComponent,
    TeacherViewComponent,
    SubjectMapComponent,
    EvalFormComponent,
    EvalScedComponent,
    CalendarViewComponent,
    GenReportComponent,
    SettingsComponent,
    TdashboardComponent,
    TsubjectMapComponent
  ],
  imports: [
    BrowserModule,    
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgChartsModule,
    FullCalendarModule,
  ],
  providers: [],
  bootstrap: [AppComponent] 
})
export class AppModule {

 }
