import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-eval-sced',
  standalone: false,
  templateUrl: './eval-sced.component.html',
  styleUrl: './eval-sced.component.css'
})
export class EvalScedComponent implements OnInit{
    errorMessage= ""
    isSidebarOpen = false;
    gradeSelectionInvalid = false;
    showScheduleModal = false;
    dateRangeInvalid = false;
    questionnaireIDs: number[] = [];
    selectedQID: number | null = null;
   
    scheduleData = {
    title: '',
    questionnaireId: 0,
    targetGrades: [] as string[],
    startDate: '',
    endDate: '',
    status: 'Active',
    schoolYear: '2025', 
    adminId: '' 
  };


    constructor(private router: Router, private sharedService:SharedService){
      
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
                  this.router.navigate(['/eval-sced']);
                  break;
                case 'Teacher':
                  this.sharedService.CurrentTeacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
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
      this.getAllQuestionnaireIDs();
    }

    
getAllQuestionnaireIDs() {
  this.sharedService.getAllQuestionnaireIDs().subscribe({
    next: (res) => {
      console.log('All QIDs:', res); 
      this.questionnaireIDs = res;
    },
    error: (err) => {
      console.error('Failed to fetch QIDs:', err);
    }
  });
}

toggleGrade(event: any) {
  const grade = event.target.value;
  if (event.target.checked) {
    this.scheduleData.targetGrades.push(grade);
  } else {
    this.scheduleData.targetGrades = this.scheduleData.targetGrades.filter(g => g !== grade);
  }
}


onSubmit(form: NgForm) {
    if (form.invalid) {
      // Show validation errors
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    if (this.scheduleData.targetGrades.length === 0) {
      this.gradeSelectionInvalid = true;
      return;
    }else {
      this.gradeSelectionInvalid = false;
    }
    
          // Custom: Check date range validity
      const start = new Date(this.scheduleData.startDate);
      const end = new Date(this.scheduleData.endDate);
      if (end < start) {
        this.dateRangeInvalid = true;
        return;
      } else {
        this.dateRangeInvalid = false;
      }
    
      this.scheduleData.adminId = this.sharedService.CurrentAdmin.AdminID!;
      this.scheduleData.questionnaireId = this.selectedQID!;

      const payload = {
        title: this.scheduleData.title,
        questionnaireID: this.scheduleData.questionnaireId,
        startDate: this.scheduleData.startDate,
        endDate: this.scheduleData.endDate,
        status: this.scheduleData.status,
        targetGrades: this.scheduleData.targetGrades, // already string[]
        schoolYear: this.scheduleData.schoolYear,
        adminID: this.scheduleData.adminId
      };

     this.sharedService.createSchedule(payload).subscribe({
        next: (res) =>{
          if(res.status === "success"){
            this.errorMessage = "Evaluation Schedule Saved Successfully";
            this.closeScheduleModal();
          }else{
             this.errorMessage = "Unexpected response from server.";
          }
        },
        error: (err) => {
        console.error('Failed to stored:', err);
        this.errorMessage = 'not save in db.';
      }
      });

  }

    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }

     openScheduleModal() {
      this.showScheduleModal = true;
    }

    closeScheduleModal() {
      this.showScheduleModal = false;
      this.dateRangeInvalid = false;
      this.gradeSelectionInvalid = false;
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
