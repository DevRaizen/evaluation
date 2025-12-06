import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';
import jsPDf from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  questionnaires: { QID: number; QTitle: string }[] = [];
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


    constructor(private router: Router, private sharedService:SharedService,private route: ActivatedRoute,private sanitizer: DomSanitizer){
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
                    this.showScheduleModal = this.sharedService.schedmod;
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
       setTimeout(() => this.sharedService.schedmod = false,200);
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
      this.sharedService.getPendingStudents().subscribe((res: any) => {
            if (res.status === 'success') {
              this.pendingList = res.data;
              console.log(this.pendingList)
            }
          });
      setTimeout(() => this.skipAnimation = false);
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
            this.successMessage = "Updated Successfully";
            this.ngOnInit()
          }else{
            this.errorMessage = res.message;
    
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
      console.log('All Questionnaires:', res); 
      this.questionnaires = res.map((q: any) => ({
        QID: q.QID,
        QTitle: q.QTitle // make sure your backend returns QTitle
      }));
    },
    error: (err) => {
      console.error('Failed to fetch Questionnaires:', err);
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

   pdfBlobUrl: SafeResourceUrl | null = null;
  showPDFPreview = false;

  exportScheduletoPDF() {
    const doc = new jsPDf('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // === HEADER BAR ===
    doc.setFillColor(140, 34, 36); // red header
    doc.rect(0, 0, pageWidth, 30, 'F');

    // === LOGO ===
    const logoPath = '/stroselogo.png';
    try {
      doc.addImage(logoPath, 'PNG', 30, 5, 40, 20);
    } catch (e) {
      console.warn('Logo not found or not loaded yet.');
    }

    // === SCHOOL NAME ===
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(17);
    doc.text('Saint Rose of Lima Catholic School', pageWidth / 2 + 10, 15, { align: 'center' });

    // === REPORT TITLE ===
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.text('Evaluation Schedule Report', pageWidth / 2 + 10, 23, { align: 'center' });

    // === REPORT INFO ===
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const generatedDate = new Date().toLocaleString();
    let y = 45;
    const info = [
      ['Report Type:', 'Evaluation Schedule'],
      ['Generated On:', generatedDate],
    ];

    info.forEach(([label, value]) => {
      doc.setFont('times', 'bold');
      doc.text(label, 14, y);
      doc.setFont('times', 'normal');
      doc.text(value, 60, y);
      y += 7;
    });

    doc.setDrawColor(140, 34, 36);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;

    // === TABLE CONTENT ===
    const headers = [['Title', 'Start Date', 'End Date', 'Status', 'School Year', 'Target Grade']];
    const data = this.EvaluationSettings.map((set: any) => [
      set.Title,
      set.StartDate,
      set.EndDate,
      set.Status,
      set.SchoolYear,
      set.TargetGrade,
    ]);

    autoTable(doc, {
      startY: y,
      head: headers,
      body: data,
      theme: 'striped',
      headStyles: {
        fillColor: [140, 34, 36],
        textColor: [255, 255, 255],
        halign: 'center',
      },
      styles: {
        font: 'times',
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (dataArg) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || doc.internal.pageSize.getHeight();

        // === FOOTER ===
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        const totalPages = doc.internal.pages.length - 1;
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(
          `Generated by EvalOn • Page ${pageNumber} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      },
    });

    // === PREVIEW PDF ===
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.showPDFPreview = true;
  }

  closePDFPreview() {
    this.showPDFPreview = false;
    this.pdfBlobUrl = null;
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
