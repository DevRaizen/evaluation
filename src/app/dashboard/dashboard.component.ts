  import { Component, HostListener, OnInit } from '@angular/core';
  import { ApiService } from '../api.service';
  import { Router } from '@angular/router';
  import { ChartOptions, ChartType, ChartData } from 'chart.js';
  import { Chart } from 'chart.js/auto';
import { SharedService } from '../shared.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
  @Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
  })
  export class DashboardComponent implements OnInit {
    compRate: any;
    showLogoutModal = false;
    avatar?: any;
    url = ""
    studentcount: any = 0;
    teachercount: any = 0;
    isSidebarOpen = false;
    
    gradeCounts: { [grade: string]: number } = {};
    countGrade7 = 0;
    countGrade8 = 0;
    countGrade9 = 0;
    countGrade10 = 0;

    subGrade7 = 0;
    subGrade8 = 0;
    subGrade9 = 0;
    subGrade10 = 0;
    totalStudentCount = 0;
    totalSubCount = 0;
  
    constructor(private sharedService: SharedService, private router: Router) {
      this.avatar = this.sharedService.defaultAvatar;
      this.url = this.sharedService.burl
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

    ngOnInit(){
          this.sharedService.getStudentCount().subscribe(res => {
            if(res.status === 'success'){
              this.studentcount = res.count;
            }
          });

            this.sharedService.getTeacherCount().subscribe(res => {
            if(res.status === 'success'){
              this.teachercount = res.count;
            }
          });
          this.sharedService.getStudCountbyGrade().subscribe({
            next: (res) =>{
                  if(res.status === "success"){
                     const gradeCounts: { [grade: string]: number } = res.counts;
                      
                      this.gradeCounts = gradeCounts;
                      const subjectsPerStudent = 8;

                      this.countGrade7  = (gradeCounts['7']  || 0) * subjectsPerStudent;
                      this.countGrade8  = (gradeCounts['8']  || 0) * subjectsPerStudent;
                      this.countGrade9  = (gradeCounts['9']  || 0) * subjectsPerStudent;
                      this.countGrade10 = (gradeCounts['10'] || 0) * subjectsPerStudent;


                      this.totalStudentCount = (this.countGrade7 + this.countGrade8 + this.countGrade9 + this.countGrade10 )

                      console.log('Grade counts:', gradeCounts);
                  }
            },
            error: (err) =>{

            }
          })
    // ✅ Register the datalabels plugin
              // ✅ Register the datalabels plugin
    Chart.register(ChartDataLabels);
          this.getSchoolYear();

          this.getEvalSet()
          
      }


    menuOpen: boolean = false;
    user: any | null = null;

    toggleMenu()  
    {
    if(this.menuOpen == true){
      this.menuOpen = false;
    }else{
      this.menuOpen = true;
    }
    };

 SchoolYear: any[] = [];
selectedSchoolYearID: any;


    onSchoolYearChange() {

      
  console.log('🟡 SchoolYear Changed:', this.selectedSchoolYearID);

  if (this.selectedSchoolYearID) {
    this.loadTop3Teachers();
    
  } else {
    console.warn("⚠️ No SchoolYear selected");
  }
}

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

        this.loadTop3Teachers()
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}
  topTeachers: any[] = []
loadTop3Teachers() {
  this.sharedService.getTop3TeachersByAverage(this.selectedSchoolYearID!).subscribe({
    next: (res) => {
      if (res.status === 'success' && res.top3.length > 0) {
        this.topTeachers = res.top3.map((t: any) => ({
          ...t,
          FinalAvg: Number(parseFloat(t.FinalAvg).toFixed(1))
        }));

        console.log("🏆 Top 3 Teachers:", this.topTeachers);

        let completed = 0;

        this.topTeachers.forEach((teacher: any) => {
          this.sharedService.getHighestCategory(teacher.TeacherID, this.selectedSchoolYearID!).subscribe({
            next: (catRes) => {
              if (catRes.status === 'success') {
                teacher.HighestCategory = catRes.HighestCategoryName;
                teacher.HighestScore = Number(catRes.HighestCategoryScore);
              }
              completed++;
              if (completed === this.topTeachers.length) {
                // ✅ render the chart only after all API calls are done
                this.renderTopTeachersChart();
              }
            },
            error: (err) => {
              console.error(`Error getting highest category for ${teacher.TeacherName}:`, err);
              completed++;
              if (completed === this.topTeachers.length) {
                this.renderTopTeachersChart();
              }
            }
          });
        });
      } else {
        this.topTeachers = [];
        this.chart.destroy();
        console.warn("⚠️ No top teachers found.");
      }
    },
    error: (err) => {
      console.error("❌ Error loading top 3 teachers:", err);
    }
  });
}

 
    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
    }

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

   
   chart: any; // to store chart instance
 renderTopTeachersChart() {
  if (this.chart) {
    this.chart.destroy();
  }

  const labels = this.topTeachers.map(t => t.TeacherName);
  const scores = this.topTeachers.map(t => t.HighestScore);
  

  // ✅ Dynamic color logic
  const backgroundColors = scores.map((val) => {
    if (val >= 4.0) return '#22c55e'; // green
    if (val >= 3.0) return '#facc15'; // yellow
    return '#ef4444'; // red
  });

  const ctx = document.getElementById('topTeachersChart') as HTMLCanvasElement;
  if (!ctx) return;

  Chart.register(ChartDataLabels);

  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Rating',
        data: scores,
        backgroundColor: backgroundColors,
        borderRadius: 8,
        barThickness: 'flex', // ✅ flexible bar thickness
        maxBarThickness: 50
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // ✅ allows the chart to fill container
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'center',
          align: 'start',
          formatter: (value: number) => value.toFixed(1),
          color: '#000',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `Rating: ${tooltipItem.parsed.y.toFixed(1)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1,
            color: '#4b5563', // gray-700
            font: { size: 11 }
          },
          grid: {
            color: '#e5e7eb'
          }
        },
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
            callback: function (value, index, ticks) {
              // ✅ truncate long labels with "..."
              const label = this.getLabelForValue(value as number);
              return label.length > 12 ? label.substring(0, 12) + '…' : label;
            },
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}
 
getBarColor(score: number): string {
  if (score >= 4.0) return '#22c55e'; // green
  if (score >= 3.0) return '#facc15'; // yellow
  return '#ef4444'; // red
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

   EvaluationSettings: any[] = [];
  ActiveEvalutaion?: any;
  duration: { days: number; hours: number; mins: number } = { days: 0, hours: 0, mins: 0 };
today = new Date(Date.now() + (8 * 60 * 60 * 1000));

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

           return (
            setting.Status === 'Active' &&
            today >= startDate &&
            today <= endDate
          );

        // Match student's grade (e.g., 8) with TargetGrade string
       
          });
            console.log(this.ActiveEvalutaion,"Eto ACtive")

            if (this.ActiveEvalutaion) {
             
            this.duration = this.getBetweenDays(this.today.toISOString(), this.ActiveEvalutaion.EndDate);
          }
          }


          this.sharedService.getRawSubmissionCountByGrade( this.ActiveEvalutaion.ESetID).subscribe({
            next: (res) => {
              if (res.status === 'success') {
                const gradeCounts = res.data.grades;
                console.log('Raw submission count by grade:', gradeCounts);

                this.subGrade7 = (gradeCounts['7']  || 0) ;
                this.subGrade8  = (gradeCounts['8']  || 0) ;
                this.subGrade9  = (gradeCounts['9']  || 0) ;
                this.subGrade10 = (gradeCounts['10'] || 0) ;

                this.totalSubCount = (this.subGrade7 + this.subGrade8 + this.subGrade9 + this.subGrade10)

                this.compRate = (this.totalSubCount / this.totalStudentCount) * 100;
              }
            },
            error: (err) => {
              console.error('Error fetching raw submission count:', err);
            }
          });

        },
        error: (err)=>{
           //this.errorMessage = "Database Error";
           console.log("Database Error")
        }
      })
  }




  }
