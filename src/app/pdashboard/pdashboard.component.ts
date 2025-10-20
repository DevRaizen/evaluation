import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { SharedService } from '../shared.service';
import { ApiService } from '../api.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-pdashboard',
  standalone: false,
  templateUrl: './pdashboard.component.html',
  styleUrl: './pdashboard.component.css'
})
export class PdashboardComponent {
teachers: any[] = [];
  isSidebarOpen = false;
  public barChartPlugins = [];
  avatar = ""
selectedTeacher: any = null;
selectedTeacherId: string | null = null;
  teacherData: any = [];
  feedbackList: string[] = [];
  positiveFeedbacks: string[] = [];
  negativeFeedbacks: string[] = [];
  neutralFeedbacks: string[] = [];
  chart: any;
  ratingChart: any;
  highestCategory: any;
  overallAverage: any;
  selectedSchoolYear: any;
  teacherStudentResCount: any = null;
  responseCount = 0;
  responseMax = 0;
  constructor(private sharedService: SharedService, private router: Router,private Sentiments:  ApiService) {
        this.avatar = this.sharedService.defaultAvatar;
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
    Chart.register(ChartDataLabels);
    this.loadTeachers();
    this.getSchoolYear();
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

        this.loadTeacherDashboard();
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}

    onSchoolYearChange() {
  console.log("Selected School Year:", this.selectedSchoolYear);

  // Reload the dashboard with the new school year
  this.loadTeacherDashboard();
}



loadTeachers() {
  this.sharedService.getAllTeachers().subscribe({
    next: (res) => {
      if (res.status === 'success') {
        console.error('kuha',);
        this.teachers = res.teachers.map((t: any) => ({
          ...t,
          fullName: `${t.Fname} ${t.Mname} ${t.Lname}`,
          imageUrl: t.image === 'user.png' 
            ? this.sharedService.defaultAvatar 
            : `${this.sharedService.burl}${t.image}`
        }));

        // Default selection → first teacher
        if (this.teachers.length > 0) {
          this.selectedTeacherId = this.teachers[0].TeacherID;
          this.updateSelectedTeacher();
        }
      }
    },
    error: (err) => {
      console.error('Failed to fetch teachers:', err);
    }
  });
}

loadTeacherDashboard() {
   
    this.sharedService.getTeacherDashboardData(this.selectedTeacherId!,this.selectedSchoolYearID).subscribe({
      next: (res) =>{
            if(res.status == "success"){
              this.teacherData = res.data;
              console.log(this.teacherData)

              if(this.teacherData.length > 0){
                  const labels = this.teacherData.map((d: any) => d.categoryName);
                  const values = this.teacherData.map((d: any) => parseFloat(d.AvgScore));

                  // create chart
                  this.renderChart(labels, values);
                  
                  this.highestCategory = this.getHighestCategory(); 
                  this.overallAverage =  this.getOverallAverage();
                  this.renderRatingChart(this.overallAverage,this.highestCategory.categoryName);
              }else{
                   this.teacherData = [];

                    // show an empty chart or a placeholder message
                    this.renderChart(["No Data"], [0]);
                    this.renderRatingChart(0,"No Data");
              }
              console.log("nakuha mo");

            
            }else{
              console.log("ayaw makuha")

              
            }
      },
      error: (err) => {
            console.log(err);
      }
    });
    

    this.sharedService.getTeacherStudentCount(this.selectedTeacherId!, this.selectedSchoolYearID!).subscribe({
    next: (res) => {
      if (res.status === 'success' && res.data.length > 0) {
        this.teacherStudentResCount = res.data[0];
        this.responseMax = this.teacherStudentResCount.StudentCount 
        console.log("Student Count:", this.teacherStudentResCount);
      } else {
         this.responseMax = 0;
        console.log("No student count found");
      }
    },
    error: (err) => {
       this.responseMax = 0;
      console.error("Failed to fetch student count:", err);
    }
  });

  this.sharedService.getTeacherResponseCount(this.selectedTeacherId!,this.selectedSchoolYearID).subscribe({
    next: (res) => {
       console.log(res,"qweqweqw")
      if (res.status === 'success') {
       
        this.responseCount = res.data.ResponseCount;
        console.log('Current response count:', this.responseCount);
      } else {
        console.log(res,"qweqweqw")
        console.error('Error fetching response count:', res.message);
        this.responseCount = 0;
      }
    },
    error: (err) => {
      
      console.error('Database error:', err);
      this.responseCount = 0;
    }
  });

   this.sharedService.getTeacherFeedback(this.selectedTeacherId!, this.selectedSchoolYearID)
    .subscribe({
      next: (res) => {
        if (res.status === 'success' && res.feedback.length > 0) {
          const allFeedbacks = res.feedback[0].AllFeedbacks;
          this.feedbackList = allFeedbacks ? allFeedbacks.split(' || ') : [];
          
          this.Sentiments.analyzeText(this.feedbackList).subscribe({
          next: (res) => {
            if (res.status === 'success') {
              this.positiveFeedbacks = res.positive;
              this.negativeFeedbacks = res.negative;
              this.neutralFeedbacks = res.neutral;

              console.log("Positive:", this.positiveFeedbacks);
              console.log("Negative:", this.negativeFeedbacks);
              console.log("Neutral:", this.neutralFeedbacks);
            }else{
              this.feedbackList = [];
            }
          },
          error: (err) => {
            console.error("NLP API error:", err);
          }
        });

          console.log('Feedbacks:', this.feedbackList);
        } else {
          this.feedbackList = [];
          console.log('No feedback found');
        }
      },
      error: (err) => {
        console.error('Error loading feedback:', err);
      }
    });

  }

onTeacherChange() {
  this.updateSelectedTeacher();
  this.loadTeacherDashboard()
}

updateSelectedTeacher() {
  this.selectedTeacher = this.teachers.find(
    t => t.TeacherID === this.selectedTeacherId
  );
  if (!this.selectedTeacher) return;

  if (!this.selectedTeacher.imageUrl || this.selectedTeacher.image === '/user.png') {
    this.selectedTeacher.imageUrl = this.sharedService.defaultAvatar;
  } else {
    this.selectedTeacher.imageUrl = `${this.sharedService.burl}${this.selectedTeacher.image}`;
  }
}
  
  goToDashboard(){
        this.router.navigate(['/pdashboard']);
    }
  goToSettings() {
        this.router.navigate(['/settings']);
    }

    
  getProgress(): number {
  if (!this.responseMax || this.responseMax === 0) return 0;
  return (this.responseCount / this.responseMax) * 100;
}
 getHighestCategory() {
  if (!this.teacherData || this.teacherData.length === 0) {
    return null; 
  }

  
  let highest = this.teacherData[0];

  this.teacherData.forEach((item: any) => {
    if (parseFloat(item.AvgScore) > parseFloat(highest.AvgScore)) {
      highest = item; 
    }
    
  });

  
  return {
    categoryName: highest.categoryName,
    avgScore: parseFloat(highest.AvgScore)
  };
}

getOverallAverage(): number {
  if (!this.teacherData || this.teacherData.length === 0) {
    return 0; // no data case
  }

  const total = this.teacherData.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.AvgScore);
  }, 0);

 return parseFloat((total / this.teacherData.length).toFixed(1));
}

renderChart(labels: string[], values: number[]) {
  const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;

  if (this.chart) {
    this.chart.destroy();
  }

  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Rating',
          data: values,
          // ✅ dynamic colors per bar based on value
          backgroundColor: values.map((val) => {
            if (val >= 4.0) return '#22c55e'; // green
            if (val >= 3.0) return '#facc15'; // yellow
            return '#ef4444'; // red
          }),
          borderRadius: 5,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1
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
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          // ✅ control label position
          anchor: 'end', // <-- position reference (start, center, end)
          align: 'start',  // <-- actual placement inside bar
          formatter: (value: number) => value.toFixed(1), // shows "4.2"
          color: '#000',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        tooltip: {
          callbacks: {
            // ✅ show full label in tooltip if truncated
            title: (tooltipItems) => {
              const item = tooltipItems[0];
              return labels[item.dataIndex];
            }
          }
        }
      }
    }
  });
}

  renderRatingChart(avg: any, label: any) {
  const ctx = document.getElementById('ratingChart') as HTMLCanvasElement;

  const remaining = 5.0 - avg;

  if (this.ratingChart) {
    this.ratingChart.destroy();
  }

  this.ratingChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [label], // you can keep this, it won’t show in chart
      datasets: [
        {
          data: [avg, remaining],
          backgroundColor: ['#FACC15', '#E5E7EB'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        },
        datalabels: {
          display: false // ✅ hide labels for this chart only
        }
      }
    }
  });
}


getRatingAvg(): number {
  return this.ratingChart?.data?.datasets[0]?.data[0] ?? 0;
}
getLabel(): any  {
  return this.ratingChart?.data?.labels?.[0] ?? 0;
}
}
