import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-view',
  standalone: false,
  templateUrl: './student-view.component.html',
  styleUrl: './student-view.component.css'
})
export class StudentViewComponent {
  isSidebarOpen = false;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router){}

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
        this.router.navigate(['/dashboard']);
      }
    goToManageUser() {
        this.router.navigate(['/manage-user']);
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
