import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-tdashboard',
  standalone: false,
  templateUrl: './tdashboard.component.html',
  styleUrl: './tdashboard.component.css'
})
export class TdashboardComponent{
  errorMessage ="";
  showLogoutModal = false;
  avatar?: any;
  isSidebarOpen = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  responseCount = 1230;
  responseMax = 1500;
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
  SchoolYear: any = [];

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
                  this.router.navigate(['/tdashboard']);
                  this.Teacher = this.sharedService.CurrentTeacher;
                  console.log(this.Teacher);
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
    this.renderChart();
    this.renderRatingChart();
    this.getProfile();
    this.getSchoolYear();
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
  if (!this.selectedFile || !this.Teacher.TeacherID) {
    console.warn("No file or Teacher ID found.");
    return;
  }
  const payload ={
    userid: this.Teacher.TeacherID,
    userRole: this.Teacher.UserType,
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

getSchoolYear(){
    this.sharedService.getSchoolYear().subscribe({
      next: (res) => {
        if(res.status === 'success'){
          this.SchoolYear = res.schoolYears
          console.log(this.SchoolYear);
        }
      },
      error: (err) =>{

      }
    })
  }

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

    openLogoutModal() {
      this.showLogoutModal = true;
    }

    closeLogoutModal() {
      this.showLogoutModal = false;
    }

  renderChart() {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Respect', 'Punctuality', 'Communication', 'Responsible', 'Professionalism'],
        datasets: [
          {
            label: 'Rating',
            data: [4, 4.5, 4, 4.3, 5.0], // adjust to your real values
            backgroundColor: [
              '#FDE68A',
              '#FCD34D',
              '#FDE68A',
              '#FCD34D',
              '#FACC15'
            ],
            borderRadius: 5,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 5
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  renderRatingChart() {
  const ctx = document.getElementById('ratingChart') as HTMLCanvasElement;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [4.8, 0.2],
          backgroundColor: ['#FACC15', '#E5E7EB'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      cutout: '80%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });
}

}
