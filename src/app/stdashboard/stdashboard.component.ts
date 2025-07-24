import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-stdashboard',
  standalone: false,
  templateUrl: './stdashboard.component.html',
  styleUrl: './stdashboard.component.css'
})
export class StdashboardComponent implements OnInit {
  errorMessage = "";
  Student: {
  Fname?: string;
  Mname?: string;
  Lname?: string;
  StudID?: string;
  Grade?: string;
  AccID?: number;
  Section?: string;
  PhoneNumber?: string;
  Email?: string;
  Password?: string;
  UserType?: string;
} = {};
  EvaluationSettings: any[] = [];
  ActiveEvalutaion?: any;
  teachermap: any[] = [];
  showLogoutModal = false;
  avatar: string | null = null;
  selectedFile: File | null = null;
  isSidebarOpen = false;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router, private sharedService: SharedService){
        this.avatar = this.sharedService.defaultAvatar;
        this.imagePreview = this.sharedService.defaultAvatar;
        const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userType = parsedUser.UserType;


              switch (userType) {
                case 'Student':
                  this.sharedService.CurrentStudent = parsedUser;
                  this.router.navigate(['/stdashboard']);
                  this.Student = this.sharedService.CurrentStudent;
                  console.log(this.Student);
                  
                  break;
                case 'Admin':
                  this.sharedService.Admin = parsedUser;
                  this.router.navigate(['/dashboard']);
                  break;
                case 'Teacher':
                  this.sharedService.Teacher = parsedUser;
                  this.router.navigate(['/tdashboard']);
                  break;
                default:
                  // Unknown role, redirect to login
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
    this.getProfile();
    this.getStudentTeacher();
    this.getEvalSet();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
        console.log(this.selectedFile)
        this.saveProfileImage();
      }
    }

  saveProfileImage() {
  if (!this.selectedFile || !this.Student.StudID) {
    console.warn("No file or StudID ID found.");
    return;
  }
  const payload ={
    userid: this.Student.StudID,
    userRole: this.Student.UserType,
  }

  this.sharedService.saveProfile(payload, this.selectedFile).subscribe({
    next: (response) => {
      if (response.status === 'success') {
        console.log('Profile image saved successfully!');
        this.errorMessage = "Profile image saved successfully!";
        // Optionally update avatar image if you have one
        // this.avatar = 'path-to-new-image';
      } else {
        console.error('Upload failed:', response.message);
        this.errorMessage = "ayaw ma save";
      }
    },
    error: (err) => {
      console.error("Upload error:", err);
      this.errorMessage = "ayaw ma save e";
      console.log(err);
    }
  });
}

getProfile(){
     const payload = {
      userid: this.Student.StudID,
      userRole: this.Student.UserType
     }
     console.log(payload);
    this.sharedService.getProfile(payload).subscribe({
      next: (res) =>{
        console.log("response",res);
        if(res && res.status === 'success' && res.image){
          if (res.image === '/user.png') {
            this.avatar = res.image;
            this.imagePreview = res.image;
          
        } else {
          this.avatar = `${this.sharedService.burl}${res.image}`;
          this.imagePreview = `${this.sharedService.burl}${res.image}`;
          
        }
        }else{
          this.avatar = this.sharedService.defaultAvatar;
          this.imagePreview = this.sharedService.defaultAvatar;
          
        }
      },
      error: (err)=>{
       this.errorMessage ="di mo nakuhaprofile boi";
       console.log(err);
      }
    });
  }

  getStudentTeacher(){
    this.sharedService.getTeacherOfStudent(this.Student.StudID!).subscribe({
      next: (res) => {
        if(res.status === "success"){
            this.teachermap = res.mappings;
            console.log("nakuha mo mga teacher")
            console.log(this.teachermap)
        }else{
          this.errorMessage = "anyare";
        }
      },
      error: (err) => {
        this.errorMessage = "sira database";
        console.log(err);
      }
    });
  }

  getEvalSet(){
    this.sharedService.getAllEvaluationSettings().subscribe({
        next: (res) =>{
          if(res.status === 'success'){
            this.EvaluationSettings = res.evalsettings;
            console.log(this.EvaluationSettings)
          // const today = new Date().toISOString().split('T')[0];  // delay ng 1day

          //  const today = new Date(Date.now() + (8 * 60 * 60 * 1000)).toISOString().split('T')[0]; // ph time string
            const today = new Date(Date.now() + (8 * 60 * 60 * 1000));
            today.setHours(0, 0, 0, 0); 
            
            console.log(today);
        
         this.ActiveEvalutaion = this.EvaluationSettings.find(setting =>{
            const startDate = new Date(setting.StartDate);
            const endDate = new Date(setting.EndDate);

            startDate.setHours(0,0,0,0);
            endDate.setHours(0,0,0,0);

            const isActive =
          setting.Status === 'Active' &&
          today >= startDate &&
          today <= endDate;

        if (!isActive) return false;

        // Match student's grade (e.g., 8) with TargetGrade string
        const allowedGrades = setting.TargetGrade.split(',')
          .map((ge: any) => ge.trim().replace('Grade ', ''));

        return allowedGrades.includes(this.Student.Grade);
          });
            console.log(this.ActiveEvalutaion,"Eto ACtive")
          }
        },
        error: (err)=>{
           this.errorMessage = "Database Error";
        }
      })
  }
  
    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }   
    goToDashboard(){
        this.router.navigate(['/stdashboard']);
      }
    goToEvalForm() {
        this.router.navigate(['steval-form']);
      }
    goToSettings() {
        this.router.navigate(['/stsettings']);
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
