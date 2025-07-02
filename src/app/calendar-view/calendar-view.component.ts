import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-calendar-view',
  standalone: false,
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.css'
})
export class CalendarViewComponent {
    isSidebarOpen = false;
    calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      events: [
        {
          title: 'Midyear Eval 2025 Start Date',
          date: '2025-06-01',
          color: '#00BFA6',
        },
        {
          title: 'Midyear Eval 2025 End Date',
          date: '2025-06-05',
          color: '#00BFA6',
        }
      ]
    };
    
    constructor(private router: Router){}
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
