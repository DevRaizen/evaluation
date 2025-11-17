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
    successMessage = ""
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
  teacherMappings: any[] = [];
  selectedSchoolYear = "";
  selectedSection: string | null = null;
addedSections: string[] = [];

addSection() {
   if (!this.selectedSection) {
    this.errorMessage = "Please select a section first.";
    return;
  }

  if (this.addedSections.includes(this.selectedSection)) {
    this.errorMessage = `You already added "${this.selectedSection}"`;
    this.selectedSection = null;
    return;
  }

  this.addedSections.push(this.selectedSection);
   this.selectedSection = null;
}

removeSection(section: string) {
  this.addedSections = this.addedSections.filter(s => s !== section);
}


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
                  this.router.navigate(['/tsubject-map']);
                  this.Teacher = this.sharedService.CurrentTeacher; 
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

    this.selectedSection = null;
    this.addedSections = [];
    this.formSubmitted = false
    this.sharedService.getSubPerYEar(this.selectedGrade!).subscribe({
    next: (res) =>{
      this.subjects = res.subject;
      this.selectedSubject = this.subjects[0]?.subjectid?? '';

      console.log(this.subjects,"ahahha")
    },
    error: (err) =>{
      console.log("error")
    }
    })

  }

SchoolYear: any[] = [];
selectedSchoolYearID: any;

  getSchoolYear() {
  this.sharedService.getSchoolYear().subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.SchoolYear = res.schoolYears;

        // Set default selected to the first schoolyearid
        this.selectedSchoolYearID = this.SchoolYear[0]?.SchoolYearID;

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

  getMapping(){
    this.sharedService.getTeacherSubjectMappings(this.Teacher.TeacherID!).subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.teacherMappings = res.mappings;
        
        console.log(this.teacherMappings);
        
      }
    },
    error: (err) => {
      console.error('Failed to fetch mappings:', err);
    }
  });

  }

 

  onSubjectChange() {
  this.addedSections = []
  this.selectedSection = null;
  this.formSubmitted = false
 
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
      
     // ✅ Check if sections are empty
  if (!this.addedSections || this.addedSections.length === 0) {
    this.errorMessage = "Please add at least one section before submitting.";
    return;
  }

      // Proceed with submit logic
      console.log('Form submitted');
      console.log(this.selectedSubject);
      console.log(this.selectedGrade);
      
      console.log(this.selectedSchoolYear);

      const payload = {
      teacherID: this.Teacher.TeacherID,
      subjectID: this.selectedSubject,
      grade: this.selectedGrade,
      sections: this.addedSections,
      schoolYearID: this.selectedSchoolYearID
    };

    console.log(payload,"erer")
  
      this.sharedService.saveSubjectMapping(payload).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.addedSections = [];
          this.errorMessage = 'Mapping saved successfully!';
          this.getMapping();

        } else {
          this.addedSections = [];
          this.errorMessage = res.message; // Conflict error (e.g., another teacher already assigned)
        }
      },
      error: (err) => {
        alert("An error occurred.");
        console.log(err);
      }
    });
    
  }

  cancelAddMap(){
    this.addmap = false;
    this.addedSections = [];
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

  showDeleteModal = false;
deleteDescription = '';
deleteTeacherID: string | null = null;
deleteSubjectID: number | null = null;
deleteSectionName: string | null = null;
deleteSchoolYearID: number | null = null;

openDeleteModal(mapping: any) {
  this.deleteTeacherID = this.Teacher.TeacherID!;
  this.deleteSubjectID = mapping.SubjectID;
  this.deleteSectionName = mapping.SectionName;
  this.deleteSchoolYearID = mapping.SchoolYearID;
  
  this.deleteDescription = `Are you sure you want to delete the mapping of "${mapping.SubjectName}" for section "${mapping.SectionName}"?`;
  this.showDeleteModal = true;
}

closeDeleteModal() {
  this.showDeleteModal = false;
  this.deleteDescription = '';
  this.deleteTeacherID = null;
  this.deleteSubjectID = null;
  this.deleteSectionName = null;
  this.deleteSchoolYearID = null;
}

confirmDelete() {
  console.log("deleting una")


  const payload = {
    teacherID: this.deleteTeacherID,
    subjectID: this.deleteSubjectID,
    sectionName: this.deleteSectionName,
    schoolYearID: this.deleteSchoolYearID,
    
  };
  console.log("deleting")
  this.sharedService.deleteSubjectMapping(payload).subscribe({
    next: (res: any) => {
      if (res.status === 'success') {
        this.successMessage = res.message;
        this.teacherMappings = this.teacherMappings.filter(
          t => !(t.SubjectID === this.deleteSubjectID && t.SectionName === this.deleteSectionName)
        );
        this.closeDeleteModal();
      } else {
        this.closeDeleteModal()
        this.errorMessage = res.message
      }
    },
    error: (err) => console.error(err)
  });
}

}
