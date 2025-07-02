import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
    isSidebarOpen = false;
    selected = 'weekly'; 

    constructor(private router: Router){}
    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }
    // Router
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
