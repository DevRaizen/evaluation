import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-subject-map',
  standalone: false,
  templateUrl: './subject-map.component.html',
  styleUrl: './subject-map.component.css'
})
export class SubjectMapComponent implements OnInit {
    isSidebarOpen = false;
    showModal = false;
    searchTerm = '';
    SchoolYear: any[] = [];
    selectedSchoolYearID: any;
    url =""
    avatar = ""
    pdfBlobUrl: SafeResourceUrl | null = null;
    showPDFPreview = false;
    showLogoutModal = false;
    pendingList: any[] = [];
    successMessage: string = '';
    skipAnimation = true;
    isNotifOpen = false;
teachers: any[] = [];

    constructor(private router: Router, private sharedService: SharedService,private sanitizer: DomSanitizer){
      this.url = this.sharedService.burl
      this.avatar = this.sharedService.defaultAvatar

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
                  this.router.navigate(['/subject-map']);
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
    this.getSchoolYear()
    this.sharedService.getPendingStudents().subscribe((res: any) => {
            if (res.status === 'success') {
              this.pendingList = res.data;
              console.log(this.pendingList)
            }
          });
    setTimeout(() => this.skipAnimation = false);
  }

  getSchoolYear() {
  this.sharedService.getSchoolYear().subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.SchoolYear = res.schoolYears;

           this.selectedSchoolYearID = this.SchoolYear[0]?.SchoolYearID;
           this.loadTeacher()

        // If you need the object too, you can find it
        const selectedSY = this.SchoolYear.find(sy => sy.SchoolYearID === this.selectedSchoolYearID);
        console.log('Selected SchoolYear:', selectedSY);
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}

onSchoolYearChange() {
  console.log('🟡 SchoolYear Changed:', this.selectedSchoolYearID);


  if (this.selectedSchoolYearID) {
   this.loadTeacher()
  } else {
    console.warn("⚠️ No SchoolYear selected");
  }
}

loadTeacher(){
  console.log("game")
  this.sharedService.getAllTeacherMapping(this.selectedSchoolYearID).subscribe({
    next: (res) =>{
      if(res.status === "success"){
        this.teachers = res.data
        console.log("nakuha mo ", this.teachers)
      }else{
        console.log(",ali")
      }
    },
    error: (err) =>{
      console.log(err)
      }
  })
}

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


  downloadTeacherSubjectReport() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // === HEADER BAR ===
  doc.setFillColor(140, 34, 36);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // === LOGO ===
  const logoPath = '/stroselogo.png';
  try {
    doc.addImage(logoPath, 'PNG', 20, 5, 25, 20);
  } catch {
    console.warn("Logo not loaded.");
  }

  // === SCHOOL NAME ===
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(17);
  doc.text('Saint Rose of Lima Catholic School', pageWidth / 2 + 10, 15, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text('Teacher Subject Overview Report', pageWidth / 2 + 10, 23, { align: 'center' });

  // === META INFORMATION ===
  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  const generatedDate = new Date().toLocaleString();
  const selectedSY = this.SchoolYear.find(sy => sy.SchoolYearID === this.selectedSchoolYearID)?.SchoolYear;

  let y = 45;

  doc.text(`School Year:`, 14, y);
  doc.text(selectedSY || 'N/A', 55, y);
  y += 8;

  doc.text(`Generated On:`, 14, y);
  doc.text(generatedDate, 55, y);
  y += 10;

  doc.setDrawColor(140, 34, 36);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // === TABLE: TEACHER + SUBJECTS ===
  let tableBody: any[] = [];

  this.teachers.forEach((t: any, i: number) => {
    if (t.subjects.length === 0) {
      tableBody.push([
        i + 1,
        t.TeacherName,
        "-",
        "-"
      ]);
    } else {
      t.subjects.forEach((sub: any, idx: number) => {
        tableBody.push([
          idx === 0 ? i + 1 : "",
          idx === 0 ? t.TeacherName : "",
          sub.SubjectName,
          `Grade ${sub.YearLevel} - ${sub.SectionName}`
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Teacher Name', 'Subject', 'Grade / Section']],
    body: tableBody,
    theme: 'striped',
    styles: { font: 'times', fontSize: 10, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [140, 34, 36], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  // === FOOTER (ALL PAGES) ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Generated by EvalOn • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // === PDF PREVIEW ===
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
  this.showPDFPreview = true;
}

closePDFPreview() {
  this.showPDFPreview = false;
  this.pdfBlobUrl = null;
}

confirmDownload() {
  if (this.pdfBlobUrl) {
    const a = document.createElement('a');
    a.href = this.pdfBlobUrl as string;
    a.download = 'Teacher_Subject_Overview_Report.pdf';
    a.click();
  }
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

    toggleNotif() {
      this.isNotifOpen = !this.isNotifOpen;
    }

    closeNotif() {
      this.isNotifOpen = false;
    }

}
