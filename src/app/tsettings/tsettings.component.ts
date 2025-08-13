import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-tsettings',
  standalone: false,
  templateUrl: './tsettings.component.html',
  styleUrl: './tsettings.component.css'
})
export class TsettingsComponent {
    showLogoutModal = false;
   isSidebarOpen = false;
    selected = 'weekly'; 

    constructor(private router: Router, private sharedService: SharedService){}
    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }
     openLogoutModal() {
      this.showLogoutModal = true;
    }

    closeLogoutModal() {
      this.showLogoutModal = false;
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
        logout(){
        this.sharedService.logout().subscribe(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        this.router.navigate(['/login']);
      });
      }
}
