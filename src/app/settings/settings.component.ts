import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  showLogoutModal = false;
  isSidebarOpen = false;
  errorMessage = '';
  selected = 'weekly';
  avatar?: any;
  Admin: {
    Fname?: string;
    Mname?: string;
    Lname?: string;
    AdminID?: string;
    AccID?: number;
    Email?: string;
    Password?: string;
    UserType?: string;
  } = {};
  constructor(
    private router: Router,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer,
  ) {
    this.avatar = this.sharedService.defaultAvatar;
    const storedUser =
      sessionStorage.getItem('user') || localStorage.getItem('user');

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
            this.Admin = parsedUser;
            this.router.navigate(['/settings']);
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
  openSidebar() {
    this.isSidebarOpen = true;
  }
  closeSidebar() {
    this.isSidebarOpen = false;
  }

  ngOnInit(): void {
    this.sharedService.getPendingStudents().subscribe((res: any) => {
      if (res.status === 'success') {
        this.pendingList = res.data;
        console.log(this.pendingList);
      }
    });
    setTimeout(() => (this.skipAnimation = false));
    this.getSchoolYear();
    this.loadLogs();
    this.getYearSection();
  }

  SchoolYear: any[] = [];
  selectedSchoolYearID: any;
  ActiveSchoolYear: any = [];

  getSchoolYear() {
    this.sharedService.getSchoolYears().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.SchoolYear = res.schoolYears;

          this.ActiveSchoolYear =
            this.SchoolYear.find((sy: any) => sy.Status === 'Active') || null;
          // Set default selected to the first schoolyearid
          this.selectedSchoolYearID = this.SchoolYear[0]?.SchoolYearID;

          // If you need the object too, you can find it
          const selectedSY = this.SchoolYear.find(
            (sy) => sy.SchoolYearID === this.selectedSchoolYearID,
          );
          console.log('Selected SchoolYear:', selectedSY);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onSchoolYearChange() {
    console.log('🟡 SchoolYear Changed:', this.selectedSchoolYearID);
  }

  successMessage = '';
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
        this.pendingList = this.pendingList.filter((s) => s.StudID !== studID);
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
        this.pendingList = this.pendingList.filter((s) => s.StudID !== studID);
        this.isNotifOpen = false;
      } else {
        alert('❌ ' + res.message);
      }
    });
  }

  showAddModal = false;
  nextSchoolYear = '';

  openAddSchoolYearModal() {
    // Find selected school year string
    const selectedSY = this.SchoolYear.find(
      (sy) => sy.SchoolYearID === this.selectedSchoolYearID,
    );

    if (!selectedSY) {
      alert('Please select a school year first.');
      return;
    }

    // Extract the last 4 digits (e.g., from "2024–2025" get 2025)
    const lastYear = parseInt(selectedSY.SchoolYear.slice(-4));
    const nextStart = lastYear;
    const nextEnd = lastYear + 1;
    this.nextSchoolYear = `${nextStart}-${nextEnd}`;

    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  confirmAddSchoolYear() {
    this.sharedService.addSchoolYear(this.nextSchoolYear).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.getSchoolYear(); // refresh list
          this.loadLogs();
        } else {
          alert('❌ ' + res.message);
        }
        this.closeAddModal();
      },
      error: (err) => {
        console.error(err);
        alert('Error adding new school year.');
        this.closeAddModal();
      },
    });
  }

  showConfirmModal: boolean = false;

  openConfirmModal() {
    if (!this.selectedSchoolYearID) {
      alert('Please select a school year first!');
      return;
    }
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  getSelectedSchoolYearName(): string {
    if (!this.SchoolYear || this.SchoolYear.length === 0) return 'N/A';

    const selected = this.SchoolYear.find(
      (sy) => Number(sy.SchoolYearID) === Number(this.selectedSchoolYearID),
    );

    return selected ? selected.SchoolYear : 'N/A';
  }

  confirmSetActive() {
    this.showConfirmModal = false;

    this.sharedService
      .setActiveSchoolYear(this.selectedSchoolYearID)
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.successMessage = '✅ School year updated successfully!';
            this.getSchoolYear();
            this.loadLogs(); // reload updated list
          } else {
            alert('❌ ' + res.message);
          }
        },
        error: (err) => {
          console.error('Error updating school year:', err);
        },
      });
  }

  logs: any[] = [];
  filteredLogs: any[] = [];
  searchTerm: string = '';

  filterLogs() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLogs = this.logs.filter(
      (log) =>
        log.Name.toLowerCase().includes(term) ||
        log.Activity.toLowerCase().includes(term),
    );
  }

  refreshLogs() {
    this.loadLogs();
    this.searchTerm = '';
  }

  loadLogs() {
    const payload = { action: 'getLogs' };

    this.sharedService.getLogs().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.logs = res.data;
          this.filteredLogs = [...this.logs];
        }
      },
      error: (err) => console.error('Error loading logs:', err),
    });
  }

  showModal = false;
  startDate: string = '';
  endDate: string = '';
  pdfBlobUrl: SafeResourceUrl | null = null;
  showPDFPreview = false;
  openDownloadModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.startDate = '';
    this.endDate = '';
  }

  closePDFPreview() {
    this.showPDFPreview = false;
    this.pdfBlobUrl = null;
  }
  downloadPDFReport() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // === HEADER BAR ===
    doc.setFillColor(140, 34, 36); // #8C2224
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
    doc.text('Saint Rose of Lima Catholic School', pageWidth / 2 + 10, 15, {
      align: 'center',
    });

    // === REPORT TITLE ===
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.text('Activity Logs Report', pageWidth / 2 + 10, 23, {
      align: 'center',
    });

    // === METADATA ===
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const generatedDate = new Date().toLocaleString();
    const dateRange =
      this.startDate && this.endDate
        ? `${this.startDate} to ${this.endDate}`
        : 'All Dates';

    let y = 45;
    const info = [
      ['Report Type:', 'User Activity Logs'],
      ['Date Range:', dateRange],
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

    // === FILTER LOGS BY DATE (FIXED INCLUSIVE END DATE) ===
    let filtered = this.filteredLogs;
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // ✅ include the whole end day

      filtered = this.filteredLogs.filter((log: any) => {
        const logDate = new Date(log.TimeStamp);
        return logDate >= start && logDate <= end;
      });
    }

    // === LOGS TABLE ===
    const tableBody = filtered.map((log: any) => [
      log.Name,
      log.Activity,
      new Date(log.TimeStamp).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Name', 'Activity', 'Timestamp']],
      body: tableBody,
      theme: 'striped',
      styles: {
        font: 'times',
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [140, 34, 36],
        textColor: [255, 255, 255],
      },
      margin: { left: 14, right: 14 },
    });

    // === FOOTER ===
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Generated by EvalOn • Page ${i} of ${totalPages}`,
        pageWidth / 2,
        290,
        { align: 'center' },
      );
    }

    // === PREVIEW PDF ===
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.showPDFPreview = true;

    this.closeModal();
  }

  selectedGrade: string = '';
  newSection: string = '';
  Grade: string[] = [];
  showAddModalSec = false;
  errorGrade = '';
  errorSec = '';

  getSectionsForGrade(): string[] {
    return this.allSections[this.selectedGrade] || [];
  }
  onGradeChange() {}
  addSection() {
    this.errorGrade = '';
    this.errorSec = '';

    if (!this.selectedGrade) {
      this.errorGrade = 'Please select a grade level.';
      return;
    }
    if (!this.newSectionName || this.newSectionName.trim() === '') {
      this.errorSec = 'Please enter a section name.';
      return;
    }
    console.log('Grade: ', this.selectedGrade);
    console.log('Section: ', this.newSectionName);

    this.sharedService
      .addSection(this.selectedGrade, this.newSectionName)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.successMessage = 'Section added successfully!';
            this.showAddModalSec = false;
            this.newSectionName = '';
            this.allSections = {};
            this.getYearSection()
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) => {
          console.error('Error adding section:', err);
        },
      });
  }
  getYearSection() {
    this.sharedService.getYearSec().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          const data = res.yearsec;

          data.forEach((item: any) => {
            const grade = item.YearLevel;
            const section = item.SectionName;

            if (!this.allSections[grade]) {
              this.allSections[grade] = [];
            }
            this.allSections[grade].push(section);
            console.log(this.allSections);
            this.Grade = Object.keys(this.allSections).map((key) =>
              String(key),
            );
          });
        }
      },
      error: (err) => {},
    });
  }

  allSections: { [key: string]: string[] } = {};

  gradeLevels: string[] = [];
  newSectionName: string = '';

  openAddModal(grade?: string) {
    this.selectedGrade = grade || '';
    this.showAddModalSec = true;
    this.newSectionName = '';
  }

  closeaddModal() {
    this.showAddModalSec = false;
    this.newSectionName = '';
  }

  editingEmail = false;
  editingPassword = false;
  showPassword = false;
  newPassword = '************'; // initially hidden
  toggleEmailEdit() {
    this.editingEmail = true;
  }

  cancelEmailEdit() {
    this.editingEmail = false;
    // reload from your Admin data if canceled
  }

  saveEmail() {
    this.sharedService
      .updateEmail(this.Admin.AccID!, this.Admin.Email!)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            alert('Email updated successfully!');
            this.editingEmail = false;
          } else {
            this.errorMessage = res.message;
          }
        },
        error: () => alert('Server error while updating email.'),
      });
  }

  togglePasswordEdit() {
    this.editingPassword = true;
    this.showPassword = true;
    this.newPassword = '';
  }

  cancelPasswordEdit() {
    this.editingPassword = false;
    this.showPassword = false;
    this.newPassword = '************';
  }

  savePassword() {
    if (!this.newPassword.trim()) {
      alert('Password cannot be empty!');
      return;
    }

    this.sharedService
      .updatePassword(this.Admin.AccID!, this.newPassword)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.successMessage = 'Password Updated Successfully';
            this.showPassword = false;
            this.editingPassword = false;
            this.newPassword = '************';
          }
        },
        error: (err) => {},
      });
  }
  // Router
  goToDashboard() {
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
  logout() {
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
