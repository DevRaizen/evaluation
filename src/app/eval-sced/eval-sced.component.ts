import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';
import jsPDf from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-eval-sced',
  standalone: false,
  templateUrl: './eval-sced.component.html',
  styleUrl: './eval-sced.component.css'
})
export class EvalScedComponent implements OnInit{
    showLogoutModal = false;
    itemToDeleteId: number | null = null;
    showDeleteModal = false;
    avatar: any;
    editingRowId: number | null = null;
    errorMessage= ""
    isSidebarOpen = false;
    gradeSelectionInvalid = false;
    showScheduleModal = false;
    dateRangeInvalid = false;
    questionnaireIDs: number[] = [];
    selectedQID: number | null = null;
    EvaluationSettings: any[] = [];

    scheduleData = {
    title: '',
    questionnaireId: 0,
    targetGrades: [] as string[],
    startDate: '',
    endDate: '',
    status: 'Active',
    schoolYearID: 0, 
    adminId: '' 
  };


    constructor(private router: Router, private sharedService:SharedService){
        this.avatar = this.sharedService.defaultAvatar;
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
                case 'Principal':
                  this.sharedService.Principal = parsedUser;
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
      this.getAllQuestionnaireIDs();
      this.getActiveSchoolYear();
      this.sharedService.getAllEvaluationSettings().subscribe({
        next: (res) =>{
          if(res.status === 'success'){
            this.EvaluationSettings = res.evalsettings;
          }
        },
        error: (err)=>{
           this.errorMessage = "Database Error";
        }
      })
    }

      getActiveSchoolYear(){
    this.sharedService.getActiveSchoolYear().subscribe({
      next: (res) => {
        if(res.status === 'success'){
          this.scheduleData.schoolYearID = res.schoolYears[0];
        }
      },
      error: (err) =>{

      }
    })
  }
    EditSettings(id: number){
      this.editingRowId = id;
    }
    CloseEditSettings(){
      this.editingRowId = null;
    }

    SaveEditSettings(newSetting: any){

      const start = new Date(newSetting.StartDate);
      const end = new Date(newSetting.EndDate);
     
      if (end < start) {
        this.errorMessage ="End Date cannot be earlier than Start Date."
        return;
      } 

      const original = this.EvaluationSettings.find(s => s.ESetID === newSetting.ESetID);

      /*if (
        original &&
        original.Title === newSetting.Title &&
        original.StartDate === newSetting.StartDate &&
        original.EndDate === newSetting.EndDate
      ) {
        this.errorMessage = "No changes detected.";
        return;
      }
      */
     
      const payload = {
        id: newSetting.ESetID,
        title: newSetting.Title,
        startDate: newSetting.StartDate,
        endDate: newSetting.EndDate
      };

      this.sharedService.saveSettings(payload).subscribe({
        next: (res)=>{
          if(res.status === 'success'){
            this.editingRowId = null;
            this.errorMessage = "Updated Successfully";
          }
        },
        error: (err) =>{
          this.errorMessage = "Database Error";
        }
      })

    }

confirmDelete() {
  if (this.itemToDeleteId !== null) {
    this.sharedService.deleteEvaluationSetting(this.itemToDeleteId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
         this.ngOnInit();
        } else {
          this.errorMessage = res.message || 'Delete failed';
        }
        this.closeDeleteModal();
      },
      error: () => {
        this.errorMessage = 'Server error while deleting';
        this.closeDeleteModal();
      }
    });
  }
}

getAllQuestionnaireIDs() {
  this.sharedService.getAllQuestionnaireIDs().subscribe({
    next: (res) => {
      console.log('All QIDs:', res); 
      this.questionnaireIDs = res.map((q: any) => q.QID);
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
        targetGrades: this.scheduleData.targetGrades, 
        schoolYearID: this.scheduleData.schoolYearID,
        adminID: this.scheduleData.adminId
      };

     this.sharedService.createSchedule(payload).subscribe({
        next: (res) =>{
          if(res.status === "success"){
            this.errorMessage = "Evaluation Schedule Saved Successfully";
            this.closeScheduleModal();
            this.ngOnInit();
          }else{
             this.errorMessage = res.message;
             this.closeScheduleModal();
             this.ngOnInit();
          }
        },
        error: (err) => {
        console.error('Failed to stored:', err);
        this.errorMessage = 'not save in db.';
      }
      });

  }

  exportScheduletoPDF(){
    const doc = new jsPDf();

    doc.setFontSize(16);
    doc.text('Evaluation Schedule Report',105,15,{align: 'center'});

    const headers = [['Title','Start Date','End Date','Status','Target Grade']];
    const data = this.EvaluationSettings.map(set =>[
      set.Title,
      set.StartDate,
      set.EndDate,
      set.Status,
      set.TargetGrade
    ]);

     // Add table
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [140, 34, 36] },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: 'center'
      },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || doc.internal.pageSize.getHeight();
        doc.text('Saint Rose of Lima Catholic School', data.settings.margin.left, pageHeight - 10);
      }
    });

    // Save the PDF
    doc.save('Evaluation_Schedule.pdf');
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
    
   openDeleteModal(id: number) {
  this.itemToDeleteId = id;
  this.showDeleteModal = true;
}

  closeDeleteModal() {
    this.showDeleteModal = false;
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
    goToCallendar() {
      this.router.navigate(['/calendar-view']);
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
