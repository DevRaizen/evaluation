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
    avatar?: any;
    url = ""
    isSidebarOpen = false;
    calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      events: []
    };
    
    constructor(private router: Router, private sharedService: SharedService){
         this.avatar = this.sharedService.defaultAvatar;
      
      this.url = this.sharedService.burl;
       const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userType = parsedUser.UserType;

              switch (userType) {
                case 'Student':
                  this.sharedService.CurrentStudent = parsedUser;
                  this.router.navigate(['/stdashboard']);
                  break;
                case 'Admin':
                  this.sharedService.CurrentAdmin = parsedUser;
                  this.router.navigate(['/calendar-view']);
                  break;
                case 'Teacher':
                  this.sharedService.CurrentTeacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
                  break;
                case 'Principal':
                  this.sharedService.CurrentTeacher = parsedUser;
                  this.router.navigate(['/pdashboard']);
                  break;
                default:
            
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
        this.sharedService.getPendingStudents().subscribe((res: any) => {
            if (res.status === 'success') {
              this.pendingList = res.data;
              console.log(this.pendingList)
            }
          });
        setTimeout(() => this.skipAnimation = false);
    }

    successMessage =""
    pendingList: any[] = [];
    isNotifOpen: boolean = false;
    skipAnimation = true;
    toggleNotif() {
      this.isNotifOpen = !this.isNotifOpen;
    }

    closeNotif() {
      this.isNotifOpen = false;
    }

  approveStudent(studID: string) {
    this.sharedService.approveStudent(studID).subscribe((res: any) => {
      if (res.status === 'success') {
        this.successMessage = '✅ Student approved successfully';
        this.pendingList = this.pendingList.filter(s => s.StudID !== studID);
        this.isNotifOpen = false;
      } else {
        alert('❌ ' + res.message);
      }
    });
  }

    rejectStudent(studID: string) {
        this.sharedService.rejectStudent(studID).subscribe((res: any) => {
          if (res.status === 'success') {
             this.successMessage = 'Student rejected and deleted';
            this.pendingList = this.pendingList.filter(s => s.StudID !== studID);
            this.isNotifOpen = false;
          } else {
            alert('❌ ' + res.message);
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
       goToSubjectMap(){
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
