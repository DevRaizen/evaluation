import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { SharedService } from '../shared.service';
import { Title } from 'chart.js';
import { color } from 'chart.js/helpers';

@Component({
  selector: 'app-calendar-view',
  standalone: false,
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.css'
})
export class CalendarViewComponent implements OnInit {
    isSidebarOpen = false;
    calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      events: []
    };
    
    constructor(private router: Router, private sharedService: SharedService){
        
    }

    ngOnInit(): void {
        this.sharedService.getAllEvaluationSettings().subscribe({
          next: (res)=>{
            if(res.status === 'success'){
              const evalEvent = [] as any;

              res.evalsettings.forEach((setting: any)=>{
                evalEvent.push({
                  title: `${setting.Title}  Start Date`,
                  date: setting.StartDate,
                  color: '#00BFA6'
                });
                evalEvent.push({
                  title: `${setting.Title}  End Date`,
                  date: setting.EndDate,
                  color: '#00BFA6'
                });
              });
              
              this.calendarOptions.events = evalEvent;
            }
          },
          error: (err)=>{

          }
        });
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
