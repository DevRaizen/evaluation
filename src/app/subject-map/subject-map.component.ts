import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subject-map',
  standalone: false,
  templateUrl: './subject-map.component.html',
  styleUrl: './subject-map.component.css'
})
export class SubjectMapComponent {
    isSidebarOpen = false;
    showModal = false;
    searchTerm = '';

  // Mock Data - Replace with real data from service
  assignments = [
    {
      name: 'Jane Cooper',
      subject: 'English',
      section: 'St. Agnes',
      imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      name: 'Erwin Smith',
      subject: 'Science',
      section: 'St. Paul',
      imageUrl: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      name: 'Pedro Cabang',
      subject: 'MAPEH',
      section: 'St. Peter',
      imageUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  ];

    constructor(private router: Router){}
    openSidebar() {
        this.isSidebarOpen = true;
    }
    closeSidebar() {
        this.isSidebarOpen = false;
    }

    openModal() {
      this.showModal = true;
    }

    closeModal() {
      this.showModal = false;
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

  filteredAssignments() {
    return this.assignments.filter(a =>
      a.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.section.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
