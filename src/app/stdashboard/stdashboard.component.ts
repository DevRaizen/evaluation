import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-stdashboard',
  standalone: false,
  templateUrl: './stdashboard.component.html',
  styleUrl: './stdashboard.component.css'
})
export class StdashboardComponent {
  Student: {
  Fname?: string;
  Mname?: string;
  Lname?: string;
  StudId?: string;
  Grade?: string;
  AccID?: number;
  Section?: string;
  PhoneNumber?: string;
  Email?: string;
  Password?: string;
  UserType?: string;
} = {};
  showLogoutModal = false;
  user: string | null = null;
  isSidebarOpen = false;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router, private sharedService: SharedService){
        const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userType = parsedUser.UserType;


              switch (userType) {
                case 'student':
                  this.sharedService.Student = parsedUser;
                  this.router.navigate(['/stdashboard']);
                  this.Student = this.sharedService.Student;
                  break;
                case 'admin':
                  this.sharedService.Admin = parsedUser;
                  this.router.navigate(['/dashboard']);
                  break;
                case 'teacher':
                  this.sharedService.Teacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
                  break;
                default:
                  // Unknown role, redirect to login
                  this.router.navigate(['/login']);
                  break;
              }

            } catch (e) {
              console.error('Error parsing user from storage:', e);
              this.router.navigate(['/login']);
            }
          } else {
            // No user found
            this.router.navigate(['/login']);
          }
  }


  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }

    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }   
    goToDashboard(){
        this.router.navigate(['/stdashboard']);
      }
    goToEvalForm() {
        this.router.navigate(['steval-form']);
      }
    goToSettings() {
        this.router.navigate(['/stsettings']);
      }

    logout(){
        this.sharedService.logout().subscribe(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        this.router.navigate(['/login']);
      });

      }

    openLogoutModal() {
      this.showLogoutModal = true;
    }

    closeLogoutModal() {
      this.showLogoutModal = false;
    }
}
