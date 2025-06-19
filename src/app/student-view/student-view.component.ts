import { Component } from '@angular/core';

@Component({
  selector: 'app-student-view',
  standalone: false,
  templateUrl: './student-view.component.html',
  styleUrl: './student-view.component.css'
})
export class StudentViewComponent {
  isSidebarOpen = false;
  imagePreview: string | ArrayBuffer | null = null;

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

}
