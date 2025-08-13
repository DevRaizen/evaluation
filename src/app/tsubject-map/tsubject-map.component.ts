import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-tsubject-map',
  standalone: false,
  templateUrl: './tsubject-map.component.html',
  styleUrl: './tsubject-map.component.css'
})
export class TsubjectMapComponent implements OnInit {
    showLogoutModal = false;
    addmap = false;
    formSubmitted = false;
    sectionError = false;
    selectedSubject: string = ''; 
    errorMessage ="";
    isSidebarOpen = false;
    showModal = false;
    searchTerm = '';
    avatar = "";
    imagePreview  ="";
    Teacher: {
    TeacherID?: string;
    AccID?: number;
    Fname?: string;
    Mname?: string;
    Lname?: string;
    Email?: string;
    PhoneNumber?: string;
    Password?: string;
    UserType?: string;
  } = {};
  allSections: { [key: string]: string[] } = {};
  grades: string[] = ['7', '8', '9', '10'];
  selectedGrade: string = '7';
  subjects: any[] = [];
  SchoolYear: any = [];
  teacherMappings: any[] = [];

  selectedSchoolYear = "";
  selectedSections: { [section: string]: boolean } = {};


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
                  break;
                case 'Admin':
                  this.sharedService.CurrentAdmin = parsedUser;
                  this.router.navigate(['/dashboard']);
                  break;
                case 'Teacher':
                  this.sharedService.CurrentTeacher = parsedUser;
                  this.router.navigate(['/rsubject-map']);
                  this.Teacher = this.sharedService.CurrentTeacher;
                 
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
      this.getProfile();
      this.getYearSection();
      this.getSubPerYear(this.selectedGrade);
      this.getSchoolYear();
      this.getMapping()
    }

     getProfile(){
     const payload = {
      userid: this.Teacher.TeacherID,
      userRole: this.Teacher.UserType
     }

     console.log(payload);
    this.sharedService.getProfile(payload).subscribe({
      next: (res) =>{
        console.log("response",res);
        if(res && res.status === 'success' && res.image){
          if (res.image === '/user.png') {
            this.avatar = res.image;
           
          
        } else {
          this.avatar = `${this.sharedService.burl}${res.image}`;
        
          
        }
        }else{
          this.avatar = this.sharedService.defaultAvatar;
          
        }
      },
      error: (err)=>{
       this.errorMessage ="di mo nakuhaprofile boi";
       console.log(err);
      }
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

  getSubPerYear(grade: string){
    this.selectedGrade = grade;
    this.selectedSections = {};
    this.formSubmitted = false
    this.sharedService.getSubPerYEar(this.selectedGrade!).subscribe({
    next: (res) =>{
      this.subjects = res.subject;
      this.selectedSubject = this.subjects[0]?.subjectid?? '';
      this.autoCheckExistingMappings();
      console.log(this.subjects,"ahahha")
    },
    error: (err) =>{
      console.log("error")
    }
    })

  }

  getSchoolYear(){
    this.sharedService.getSchoolYear().subscribe({
      next: (res) => {
        if(res.status === 'success'){
          this.SchoolYear = res.schoolYears
          this.selectedSchoolYear = this.SchoolYear[0];
          console.log(this.SchoolYear);
        }
      },
      error: (err) =>{

      }
    })
  }

  getMapping(){
    this.sharedService.getTeacherSubjectMappings(this.Teacher.TeacherID!).subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.teacherMappings = res.mappings;
        this.autoCheckExistingMappings();
        console.log(this.teacherMappings);
        
      }
    },
    error: (err) => {
      console.error('Failed to fetch mappings:', err);
    }
  });

  }

  autoCheckExistingMappings() {
      console.log("Checking for:", {
    selectedSubject: this.selectedSubject,
    selectedGrade: this.selectedGrade,
    selectedSchoolYear: this.selectedSchoolYear
  });
  this.teacherMappings.forEach(mapping => {
    console.log('Checking mapping:', mapping);
    if (
      mapping.SubjectID === parseInt(this.selectedSubject) &&
      mapping.YearLevel === this.selectedGrade &&
      mapping.SchoolYear === this.selectedSchoolYear
    ) {
      this.selectedSections[mapping.SectionName] = true;
    }
  });
}

  onSubjectChange() {
  this.selectedSections = {}; 
  this.formSubmitted = false
  this.autoCheckExistingMappings();
 
}


  getSelectedSectionList(): string[] {
  return Object.keys(this.selectedSections).filter(section => this.selectedSections[section]);
}
isAnySectionSelected(): boolean {
  return Object.values(this.selectedSections).some(v => v === true);
}

  onSubmit(form: NgForm) {
       this.formSubmitted = true;
    setTimeout(()=>{
        this.formSubmitted = false;
      },3000);
      
    if (form.invalid) {
      // Show validation errors
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });

      return;
    }

    const hasSelectedSection = Object.values(this.selectedSections).some(selected => selected);

      if (!hasSelectedSection) {
        this.sectionError = true;
        return;
      } else {
        this.sectionError = false;
      }

      // Proceed with submit logic
      console.log('Form submitted');
      console.log(this.selectedSubject);
      console.log(this.selectedGrade);
      console.log('Selected sections:', this.getSelectedSectionList());
      console.log(this.selectedSchoolYear);

      const payload = {
      teacherID: this.Teacher.TeacherID,
      subjectID: this.selectedSubject,
      grade: this.selectedGrade,
      sections: this.getSelectedSectionList(),
      schoolYear: this.selectedSchoolYear
    };

    console.log(payload,"erer")
  
      this.sharedService.saveSubjectMapping(payload).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.errorMessage = 'Mapping saved successfully!';
          this.getMapping();
        } else {
          this.errorMessage = res.message; // Conflict error (e.g., another teacher already assigned)
        }
      },
      error: (err) => {
        alert("An error occurred.");
        console.log(err);
      }
    });
  
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
    openLogoutModal() {
      this.showLogoutModal = true;
    }

    closeLogoutModal() {
      this.showLogoutModal = false;
    }


  // Router
    goToDashboard(){
        this.router.navigate(['/tdashboard']);
      }
   goToSubjectMap() {
        this.router.navigate(['/tsubject-map']);
      }
    goToSettings() {
        this.router.navigate(['/tsettings']);
      }
    logout(){
        this.sharedService.logout().subscribe(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        this.router.navigate(['/login']);
      });
      }

  filteredAssignments() {
    return this.teacherMappings.filter(a =>
      a.Fname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.SubjectName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      a.SectionName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
