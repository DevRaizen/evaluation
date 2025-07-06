import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tsettings',
  standalone: false,
  templateUrl: './tsettings.component.html',
  styleUrl: './tsettings.component.css'
})
export class TsettingsComponent {
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
        this.router.navigate(['/tdashboard']);
      }
      goToSubjectMap() {
        this.router.navigate(['/tsubject-map']);
      }
      goToSettings() {
        this.router.navigate(['/tsettings']);
      }
}
