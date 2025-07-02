import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eval-sced',
  standalone: false,
  templateUrl: './eval-sced.component.html',
  styleUrl: './eval-sced.component.css'
})
export class EvalScedComponent {
    isSidebarOpen = false;
    showScheduleModal = false;

    constructor(private router: Router){

    }
    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }

     openScheduleModal() {
      this.showScheduleModal = true;
    }

    closeScheduleModal() {
      this.showScheduleModal = false;
    }

    goToDashboard(){
      this.router.navigate(['/dashboard']);
    }
    goToManageUser() {
      this.router.navigate(['/manage-user']);
    }
    goToSubjectMap() {
      this.router.navigate(['/subject-map']);
    }
    goToEvalForm() {
      this.router.navigate(['/eval-form']);
    }
    goToEvalSched() {
      this.router.navigate(['/eval-sced']);
    }
    goToGenReport() {
      this.router.navigate(['/gen-report']);
    }
    goToSettings() {
      this.router.navigate(['/settings']);
    }
}
