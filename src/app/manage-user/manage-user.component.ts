import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-manage-user',
  standalone: false,
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.css'
})
export class ManageUserComponent implements OnInit{
    url = "";
    errorMessage = "";
    avatar?: any;
    showLogoutModal = false;
    isSidebarOpen = false;
    showPassword = false;
    showconPassword = false;
    Password?: string;
    conPassword?: string;
    AisModalOpen = false;
    EisModalOpen = false;
    userAccount: any[] = [];
    searchFilters = {
    name: '',
    id: '',
    role: '',
    status: ''
  };
    newAccount = {
    fname: '',
    mname: '',
    lname: '',
    email: '',
    phone: '',
    id: '',
    role: 'Student',
    gradeLevel: '',
    section: '',
    password: '',
  };
  selectedUser: any = {};

  
    constructor(private sharedService: SharedService ,private router: Router, private sanitizer: DomSanitizer){
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
                  this.router.navigate(['/manage-user']);
                  this.AisModalOpen = this.sharedService.addaccmod;
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
            
            this.router.navigate(['/login']);
          }
    }

    ngOnInit(): void {
      setTimeout(() => this.sharedService.addaccmod = false,200);
      this.sharedService.getAccount().subscribe(res => {
        if(res.status === "success"){
          this.userAccount = res.account;
        }
      });
      this.sharedService.getPendingStudents().subscribe((res: any) => {
            if (res.status === 'success') {
              this.pendingList = res.data;
              console.log(this.pendingList)
            }
          });
           this.getYearSection()
      setTimeout(() => this.skipAnimation = false);

    }


      filteredAccounts(): any[] {
        return this.userAccount.filter(user => {
          const fullName = `${user.Fname} ${user.Mname} ${user.Lname}`.toLowerCase();
      

          return (
            fullName.includes(this.searchFilters.name.toLowerCase()) &&
            user.ID.toLowerCase().includes(this.searchFilters.id.toLowerCase()) &&
            (this.searchFilters.role ? user.role.toLowerCase() === this.searchFilters.role.toLowerCase() : true) &&
            (this.searchFilters.status ? user.status.toLowerCase() === this.searchFilters.status.toLowerCase() : true)
          );
        });
      }

        getYearSection(){
          this.sharedService.getYearSec().subscribe({
            next: (res) =>{
              if(res.status === "success"){
                const data = res.yearsec;

                data.forEach((item:any)=>{
                  const grade = item.YearLevel;
                  const section = item.SectionName

                  if(!this.allSections[grade]){
                    this.allSections[grade] = [];
                  }
                  this.allSections[grade].push(section);
                  console.log(this.allSections);
                })
              }
            },
            error: (err) => {
            }
          });
    }
        
        allSections: { [key: string]: string[] } = {};

      getSectionsForGrade(grade:string): string[] {
        return this.allSections[grade] || [];
      }

      onGradeChange(account: any, gradeKey: string) {
        const grade = account[gradeKey];
        const availableSections = this.getSectionsForGrade(account.grade);
        if (!availableSections.includes(account.section)) {
          account.section = '';
        }
      }


      get gradeLevels(): string[] {
        return Object.keys(this.allSections);
      }
    
      onSubmit(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.sharedService.checkStudIdExists(this.newAccount.id).subscribe(response => {
  if (response.exists) {
    this.errorMessage = "Student ID already exists!";
  }else{
    const email = this.newAccount.email?.trim().toLowerCase();
      const isGmail = email?.endsWith('@gmail.com');
      const passwordMatch = this.Password === this.conPassword;
      const passwordLengthOk = this.Password!.length >= 8;

      if (!isGmail) {
        this.errorMessage = 'Only @gmail.com addresses are allowed.';
        return;
      }

       if (!passwordMatch) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      if (!passwordLengthOk) {
        this.errorMessage = 'Password must be at least 8 characters.';
        return;
      }

      if(this.newAccount.role === "Student" && !this.newAccount.id.startsWith("s")){
        this.errorMessage = "ID of the Students start with letter s";
        return 
      }

      if(this.newAccount.role === "Teacher" && !this.newAccount.id.startsWith("T")){
        this.errorMessage = "ID of the Teacher start with letter T";
        return 
      }

      if(this.newAccount.role === "Admin" && !this.newAccount.id.startsWith("A")){
        this.errorMessage = "ID of the Admin start with letter A";
        return 
      }

      if(this.newAccount.role === "Principal" && !this.newAccount.id.startsWith("P")){
        this.errorMessage = "ID of the Principal start with letter P";
        return 
      }

      this.sharedService.checkEmailExists(this.newAccount.email!).subscribe(response => {
          if (response.exists) {
          this.errorMessage = "Email already exists!";
          }else
              {
                if (this.newAccount.role === 'Student') {
                  this.sharedService.Student = {
                  Fname: this.newAccount.fname,
                  Mname: this.newAccount.mname,
                  Lname: this.newAccount.lname,
                  StudId: this.newAccount.id,
                  Grade: this.newAccount.gradeLevel,
                  Section: this.newAccount.section,
                  Email: this.newAccount.email,
                  Password: this.Password
                  };
                    this.sharedService.sendUserInfoToDB().subscribe({
                    next: (res)=>{
                          this.errorMessage = "Student registered successfully"
                          this.AisModalOpen = false;
                          this.ngOnInit();
                    },
                    error: (err)=>{
                          this.errorMessage = "Database Error"
                    }
                  }); // You may add success/error logic here
                } else if (this.newAccount.role === 'Teacher') {
                  this.sharedService.Teacher = {
                  Fname: this.newAccount.fname,
                  Mname: this.newAccount.mname,
                  Lname: this.newAccount.lname,
                  TeacherID: this.newAccount.id,
                  Email: this.newAccount.email,
                  Password: this.Password,
                  UserType: "Teacher"
                  };
                  this.sharedService.sendTeacherInfoToDB().subscribe({
                    next: (res)=>{
                          this.errorMessage = "Teacher registered successfully"
                          this.AisModalOpen = false;
                    },
                    error: (err)=>{
                          this.errorMessage = "Database Error"
                    }
                  }); 
                } else if (this.newAccount.role === 'Admin') {
                  this.sharedService.Admin = {
                  Fname: this.newAccount.fname,
                  Mname: this.newAccount.mname,
                  Lname: this.newAccount.lname,
                  AdminID: this.newAccount.id,
                  Email: this.newAccount.email,
                  Password: this.Password,
                  UserType: "Admin"
                  };
                  this.sharedService.sendAdminInfoToDB().subscribe({
                    next: (res)=>{
                          this.errorMessage = "Admin registered successfully"
                          this.AisModalOpen = false;
                    },
                    error: (err)=>{
                           this.errorMessage = "Database Error"
                    }
                  }); 
                }
                else if (this.newAccount.role === 'Principal') {
                  this.sharedService.Principal = {
                  Fname: this.newAccount.fname,
                  Mname: this.newAccount.mname,
                  Lname: this.newAccount.lname,
                  PrincipalID: this.newAccount.id,
                  Email: this.newAccount.email,
                  Password: this.Password,
                  UserType: "Principal"
                  };
                  this.sharedService.sendPrincipalInfoToDB().subscribe({
                    next: (res)=>{
                          this.errorMessage = "Principal registered successfully"
                          this.AisModalOpen = false;
                    },
                    error: (err)=>{
                           this.errorMessage = "Database Error"
                    }
                  }); 
                }
              }
              });
        
              }
            });
            
            }

      editUser(user: any) {
        // Copy the user data to avoid direct mutation
        this.selectedUser = { ...user };
        this.EisModalOpen = true;

        if (this.selectedUser.role === 'Student' && this.selectedUser.YearSec) {
            this.sharedService.getYearSection(this.selectedUser.YearSec).subscribe({
            next: (res) => {
              if (res.status === 'success') {
                this.selectedUser.section = res.account.SectionName;
                this.selectedUser.grade = res.account.YearLevel;
                
              } else {
                this.errorMessage = res.status || "Failed to fetch year/section";
              }
            },
            error: (err) => {
              console.error('Error fetching year/section:', err);
              this.errorMessage = "An error occurred while fetching data";
            }
          });
        }
      }

      onEditSubmit(form: NgForm) {
        if (form.invalid) {
          Object.values(form.controls).forEach(control => control.markAsTouched());
          return;
        }
        const passwordMatch = this.Password === this.conPassword;
        const passwordLengthOk = this.Password!.length >= 8;
        const edited = this.selectedUser;
        const email = edited.email?.trim().toLowerCase();
        const isGmail = email?.endsWith('@gmail.com');
        if(edited.status === "Active"){
          edited.status = 1
        }else{
          edited.status = 0
        }
        if (!isGmail) {
          this.errorMessage = 'Only @gmail.com addresses are allowed.';
          return;
        }
          if (!passwordMatch) {
              this.errorMessage = 'Passwords do not match.';
              return;
            }

            if (!passwordLengthOk) {
              this.errorMessage = 'Password must be at least 8 characters.';
              return;
            }

        if (edited.role === 'Student' && !edited.ID.startsWith('s')) {
          this.errorMessage = 'Student ID must start with "s".';
          return;
        }

        if (edited.role === 'Teacher' && !edited.ID.startsWith('T')) {
          this.errorMessage = 'Teacher ID must start with "T".';
          return;
        }

        if (edited.role === 'Principal' && !edited.ID.startsWith('P')) {
          this.errorMessage = 'Principal ID must start with "P".';
          return;
        }


        if (edited.role === 'Student') {
          this.sharedService.Student = {
          StudId: edited.ID,
          Fname: edited.Fname,
          Mname: edited.Mname,
          Lname: edited.Lname,
          Grade: edited.grade,
          Status: edited.status,
          Section: edited.section,
          Email: edited.email,
          AccID: edited.accid,
          UserType: 'Student',
          Password: this.Password
        };
        console.log('Sending updateStudent request:', this.sharedService.Student);
        this.sharedService.updateStudent().subscribe({
            next: (res) => {
              console.log("nakuha ang update")
              if (res.status === 'success') {
                this.errorMessage = res.message;
                setTimeout(() => {
              window.location.reload();
            }, 1000);
              } else {
                this.errorMessage = res.message || "Failed to fetch year/section";
              }
            },
            error: (err) => {
              this.errorMessage = "An error occurred while fetching data";
            }
          });
        } else if (edited.role === 'Teacher'){
        this.sharedService.Teacher = {
          TeacherID: edited.ID,
          Fname: edited.Fname,
          Mname: edited.Mname,
          Lname: edited.Lname,
          PhoneNumber: edited.phone,
          Status: edited.status,
          Email: edited.email,
          AccID: edited.accid,
          UserType: 'Teacher',
          Password: this.Password
        };
        
          this.sharedService.updateTeacher().subscribe({
            next: (res) => {
              if (res.status === 'success') {
                this.errorMessage = res.message; 
                setTimeout(() => {
              window.location.reload();
            }, 1000);
              } else {
                this.errorMessage = res.message || "Failed to fetch year/section";
              }
            },
            error: (err) => {
              this.errorMessage = "An error occurred while fetching data";
            }
          });
        } else if (edited.role === 'Principal') {
          this.sharedService.Principal = {
          PrincipalID: edited.ID,
          Fname: edited.Fname,
          Mname: edited.Mname,
          Lname: edited.Lname,
          Email: edited.email,
          Status: edited.status,
          AccID: edited.accid,
          UserType: 'Principal',
          Password: this.Password
        };

        console.log(this.sharedService.Principal)
        this.sharedService.updatePrincipal().subscribe({
            next: (res) => {
              if (res.status === 'success') {
                this.errorMessage = res.message; 
                setTimeout(() => {
              window.location.reload();
            }, 1000);
              } else {
                this.errorMessage = res.message || "Failed to fetch year/section";
              }
            },
            error: (err) => {
              this.errorMessage = "An error occurred while fetching data";
            }
          });

        }

        
      }
      showDeleteModal = false;
      deleteDescription = ""
      deleteableUser: any = null;
      deleteUser(user: any){
      this.showDeleteModal = true;
      this.deleteableUser = user;
      this.deleteDescription = `Are you sure you  want  to delete this user Account?`
      }

      closeDeleteModal() {
          this.showDeleteModal = false;
          this.deleteableUser = null;
        }

    confirmDelete() {
  if (!this.deleteableUser) return;
   this.showDeleteModal = false;
  this.sharedService.deleteAccount(this.deleteableUser.accid).subscribe({
    next: (res) => {
      if (res.status === "success") {
       
        this.successMessage = "User account has been deactivated successfully.";
       

        // 🔁 Refresh your data after deletion
        this.ngOnInit(); // or whatever method loads your users
      } else {
        this.successMessage = "Failed to deactivate user.";
      }
    },
    error: (err) => {
      console.error('Error:', err);
      this.successMessage = "Server error. Please try again later.";
    }
  });
}


    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }

    AopenModal() {
      this.AisModalOpen = true;
    }

    AcloseModal() {
      this.AisModalOpen = false;
       this.Password = "";
      this.conPassword ="";
  }
   EopenModal() {
      this.EisModalOpen = true;
    }

    EcloseModal() {
      this.EisModalOpen = false;
      this.Password = "";
      this.conPassword ="";
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    
  }
  toggleconPasswordVisibility(): void {
    this.showconPassword = !this.showconPassword;
    
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

  // Router
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


pdfBlobUrl: SafeResourceUrl | null = null;
showPDFPreview = false;
downloadPDFReport() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // === HEADER BAR ===
  doc.setFillColor(140, 34, 36);
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
  doc.text('User Account Summary Report', pageWidth / 2 + 10, 23, { align: 'center' });

  // === METADATA SECTION ===
  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  const generatedDate = new Date().toLocaleString();
  let y = 45;

  doc.text('Generated On:', 14, y);
  doc.text(generatedDate, 60, y);
  y += 10;

  doc.setDrawColor(140, 34, 36);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // === USER ACCOUNT TABLE ===
  const tableBody = (this.userAccount ?? []).map((u: any, index: number) => [
    index + 1,
    `${u.Fname || ''} ${u.Mname || ''} ${u.Lname || ''}`.trim(),
    u.ID || 'N/A',
    u.email || 'N/A',
    u.role || 'N/A',
    u.status || 'N/A'
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Full Name', 'School ID', 'Email', 'Role', 'Status']],
    body: tableBody,
    theme: 'striped',
    styles: { font: 'times', fontSize: 10, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [140, 34, 36], textColor: [255, 255, 255] },
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
      `Generated by EvalOn • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // === PREVIEW ===
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
    a.href = (this.pdfBlobUrl as string);
    a.download = 'User_Account_Report.pdf';
    a.click();
  }
}

}
