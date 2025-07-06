import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tsubject-map',
  standalone: false,
  templateUrl: './tsubject-map.component.html',
  styleUrl: './tsubject-map.component.css'
})
export class TsubjectMapComponent {
    isSidebarOpen = false;
    showModal = false;
    searchTerm = '';

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
        this.router.navigate(['/tdashboard']);
      }
   goToSubjectMap() {
        this.router.navigate(['/tsubject-map']);
      }
    goToSettings() {
        this.router.navigate(['/tsettings']);
      }

  filteredAssignments() {
    return this.assignments.filter(a =>
      a.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.section.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
