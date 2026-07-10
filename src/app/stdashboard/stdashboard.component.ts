import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-stdashboard',
  standalone: false,
  templateUrl: './stdashboard.component.html',
  styleUrl: './stdashboard.component.css'
})
export class StdashboardComponent implements OnInit {
  showSchoolYearModal = false;
  result: any;
  imgurl = "";
  errorMessage = "";
  successMessage = "";
  successMessage1 = "";
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
  SchoolYearID?: number;
} = {};
  totalSumittedEval = 0;
  EvaluationSettings: any[] = [];
  ActiveEvalutaion?: any;
  teachermap: any[] = [];
  unevalteacher: any[] = [];
  showLogoutModal = false;
  avatar: string | null = null;
  selectedFile: File | null = null;
  isSidebarOpen = false;
  imagePreview: string | ArrayBuffer | null = null;
  today = new Date(Date.now() + (8 * 60 * 60 * 1000));
  duration: { days: number; hours: number; mins: number } = { days: 0, hours: 0, mins: 0 };
  activeSchoolYear?: number;

  constructor(private router: Router, private sharedService: SharedService){
        this.imgurl = this.sharedService.burl;
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
                case 'Principal':
                  this.sharedService.Principal = parsedUser;
                  this.router.navigate(['/pdashboard']);
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

            const evaluating = this.sharedService.getWithExpiry(`Evaluating_${this.Student.StudID}`);
            if(evaluating){
              try{
                   this.router.navigate(['/steval-form']);
                   return
              } catch (e){
                console.error('Error parsing user from storage:', e);
              }
            }
  }

  ngOnInit(): void {
    this.getProfile();
    this.getStudentTeacher();
    this.getEvalSet();
     this.getYearSection()
    
    this.sharedService.getActiveSchoolYear().subscribe({
      next:(res) =>{
            if(res.status === "success"){
              this.activeSchoolYear = res.schoolYears.length > 0 ? res.schoolYears[0].SchoolYearID : null;
              console.log("activeschoolyeaer",this.activeSchoolYear)
              console.log(this.Student.SchoolYearID)

             if (this.Student.SchoolYearID !== this.activeSchoolYear &&
              ['7', '8', '9'].includes(this.Student.Grade!)) {
            this.showSchoolYearModal = true;
          }
            }
      },
      error:(err)=>{

      }
    })
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
        this.successMessage1= "Profile image saved successfully!";
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

  getBetweenDays(start: string, end: string) : {days: number, hours: number, mins: number}{
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let diff = endDate.getTime() - startDate.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours* (1000 * 60 * 60);
  
    const mins = Math.floor(diff / (1000 * 60 ));

    return {days, hours , mins}
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
        this.errorMessage = "sira database teacher to";
        console.log(err);
      }
    });
  }

  getUnEvalStudentTeacher() {
  const eSetId = this.ActiveEvalutaion!.ESetID;  // current evaluation set
  if (!eSetId) return;

  this.sharedService.getUnevaluatedTeachers(this.Student.StudID!, eSetId)
    .subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.unevalteacher = res.mappings;
          this.totalSumittedEval = this.teachermap.length - this.unevalteacher.length;
          console.log('Teachers left to evaluate:', this.teachermap);
        } else {
          this.errorMessage = res.message || 'No teachers found';
        }
      },
      error: (err) => {
        this.errorMessage = 'Database error';
        console.error(err);
      }
    });
}

  getEvalSet(){
    this.sharedService.getEvaluationSettings().subscribe({
        next: (res) =>{
          if(res.status === 'success'){
            this.EvaluationSettings = res.evalsettings;
            console.log(this.EvaluationSettings)
          
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

            if (this.ActiveEvalutaion) {
             
            this.duration = this.getBetweenDays(this.today.toISOString(), this.ActiveEvalutaion.EndDate);
          }
          }

          this.getUnEvalStudentTeacher();
        },
        error: (err)=>{
           this.errorMessage = "Database Error";
        }
      })
  }

  startEval(SelectedTeacher: any){
    console.log(SelectedTeacher);
    const now = new Date().getTime(); // Current time in ms
    const expiryTime = now + 20 * 60 * 1000; // 20 minutes from now

    sessionStorage.setItem(`Evaluating_${this.Student.StudID}`, JSON.stringify({
      data: SelectedTeacher,
      expiry: expiryTime
    }));

    sessionStorage.setItem(`EvalSet_${this.Student.StudID}`, JSON.stringify({
      data: this.ActiveEvalutaion,
      expiry: expiryTime
    }));


    this.router.navigate(['/steval-form'])

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
        this.router.navigate(['/stsetting']);
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

          this.Grade = Object.keys(this.allSections).map(key => String(key));
        }
      },
      error: (err) => {

      }
    });
  }
  getSectionsForGrade(): string[] {
  return this.allSections[this.selectedGrade] || [];
}
onGradeChange() {
  const availableSections = this.getSectionsForGrade();

    if (!availableSections.includes(this.Section)) {
    this.selectedSection = ""; 
  }

  
  
}

Grade: string[] = []
selectedSection: string = '';
selectedGrade: string = '';
allSections: { [key: string]: string[] } = {};
 
  Section = '';

validation = false;
confirmSchoolYear(gradeRef: any, sectionRef: any) {
  // Mark as touched to trigger validation messages
  gradeRef.control.markAsTouched();
  sectionRef.control.markAsTouched();

  // Required validation
  if (!this.selectedGrade || !this.selectedSection) return;

  // Custom validation: selected grade must be < current grade

  console.log(' Proceed: Grade', this.selectedGrade, 'Section', this.selectedSection);


    this.sharedService.renewEnrollment(this.Student.AccID!, this.Student.StudID!, this.selectedGrade, this.selectedSection).subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.successMessage = 'Enrollment renewed successfully!'
      } else {
        alert(res.message);
      }
    },
    error: (err) => console.error(err)
  });

}

getFilteredGrades(): String[] {
  const currentGrade = String(this.Student.Grade);

  const currentIndex = this.Grade.indexOf(currentGrade);
  if (currentIndex === -1) return [];

  const filtered = [this.Grade[currentIndex]];
  if (this.Grade[currentIndex + 1]) {
    filtered.push(this.Grade[currentIndex + 1]);
  }

  return filtered;
}

    
}
