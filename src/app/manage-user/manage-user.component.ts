import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';

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
    role: '',
    gradeLevel: '',
    section: '',
    password: '',
  };
  selectedUser: any = {};

  
    constructor(private sharedService: SharedService ,private router: Router){
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
      this.sharedService.getAccount().subscribe(res => {
        if(res.status === "success"){
          this.userAccount = res.account;
        }
      });

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
      
        allSections: { [key: string]: string[] } = {
        '7': ['St. Peter', 'St. Paul'],
        '8': ['St. John', 'St. Agnes'],
        '9': ['St. Therese', 'St. Monica'],
        '10': ['St. Joseph', 'St. Veronica']
      };

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
        this.errorMessage = "ID of the Students start with letter T";
        return 
      }

      if(this.newAccount.role === "Admin" && !this.newAccount.id.startsWith("A")){
        this.errorMessage = "ID of the Students start with letter A";
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
                  PhoneNumber: this.newAccount.phone,
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

        if (edited.role === 'Tdmin' && !edited.ID.startsWith('A')) {
          this.errorMessage = 'Admin ID must start with "A".';
          return;
        }


        if (edited.role === 'Student') {
          this.sharedService.Student = {
          StudId: edited.ID,
          Fname: edited.Fname,
          Mname: edited.Mname,
          Lname: edited.Lname,
          Grade: edited.grade,
          Section: edited.section,
          PhoneNumber: edited.phone,
          Email: edited.email,
          AccID: edited.accid,
          UserType: 'Student',
          Password: this.Password
        };
        console.log('Sending updateStudent request:', this.sharedService.Student);
        this.sharedService.updateStudent().subscribe({
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
        } else if (edited.role === 'Teacher'){
        this.sharedService.Teacher = {
          TeacherID: edited.ID,
          Fname: edited.Fname,
          Mname: edited.Mname,
          Lname: edited.Lname,
          PhoneNumber: edited.phone,
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
        } else if (edited.role === 'Admin') {
          this.sharedService.Admin = {
          AdminID: edited.id,
          Fname: edited.fname,
          Mname: edited.mname,
          Lname: edited.lname,
          Email: edited.email,
          AccID: edited.accid,
          UserType: 'Admin',
          Password: this.Password
        };
        }

        
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



}
