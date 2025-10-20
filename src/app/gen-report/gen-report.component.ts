import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { SharedService } from '../shared.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-gen-report',
  standalone: false,
  templateUrl: './gen-report.component.html',
  styleUrl: './gen-report.component.css'
})
export class GenReportComponent implements OnInit {
      ratingChart: any;
       perfChart: any
      trendData: any[] = [];
      trendChart: any;
      GradeLevels: string[] = [];
      selectedGradeLevel: string = 'All';
      evaluationSettings: any[] = [];
      selectedEvaluationSet: string = '';
      avatar = ""
      
      selectedSchoolYear: any;
      isSidebarOpen = false;
      responseCount = 0;
      categoryBreakdown: any[] = [];
      // max
    grades = ['7', '8', '9', '10']; // grade keys as strings
    gradeCounts: { [key: string]: number } = {};
    submissionCounts: { [key: string]: number } = {};
    

      constructor(private router: Router, private sharedService: SharedService){ 
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
                  this.router.navigate(['/gen-report']);
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
      
      ngOnInit(): void {
        this.getSchoolYear();
        this.getGradeLevels();
        this.getEvaluationAllSettings();
        Chart.register(ChartDataLabels);
        setTimeout(() => {
          this.loadGradeEvaluation();
          this.loadTrendAnalysis()
          this.loadEvaluationResponseCount() 
          this.loadCategoryBreakdown()
          this.loadCounts()
        }, 500);
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

      onSchoolYearChange() {
        this.loadGradeEvaluation()
        this.loadEvaluationResponseCount() 
        this.loadCategoryBreakdown()
        this.loadCounts()
        console.log("Selected School Year:", this.selectedSchoolYear);

        }
        onGradeChange() {
        this.loadGradeEvaluation()
        this.loadTrendAnalysis()
        this.loadEvaluationResponseCount() 
        this.loadCategoryBreakdown()
        console.log("Selected School Year:", this.selectedSchoolYear);

        }
         onFormChange() {
        this.loadGradeEvaluation()
        this.loadEvaluationResponseCount() 
        this.loadCategoryBreakdown()
        this.loadCounts()
        this.renderChart()
        console.log("Selected School Year:", this.selectedSchoolYear);

        }


     

      getGradeLevels() {
        this.sharedService.getGradeLevels().subscribe({
          next: (res) => {
            if (res.status === 'success') {
              // Add “All” option manually at the top
              this.GradeLevels = [ ...res.grades];
              console.log('Grade Levels:', this.GradeLevels);
            } else {
                 console.log('Graded Levels:', this.GradeLevels);
            }
          },
          error: (err) => {
            console.error('Error fetching grade levels:', err);
          }
        });
      }

      getEvaluationAllSettings() {
        this.sharedService.getAllEvaluationSettings().subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.evaluationSettings = res.evalsettings;

            // auto-select the latest evaluation (first item)
            if (this.evaluationSettings.length > 0) {
              this.selectedEvaluationSet = this.evaluationSettings[0].ESetID;
            }

            console.log('Evaluation Settings:', this.evaluationSettings);
          } else {
            this.evaluationSettings = [];
          }
        },
        error: (err) => {
          console.error('Error fetching evaluation settings:', err);
        }
      });
    }

gradeEvaluationData: any[] = [];
    loadGradeEvaluation() {
  this.sharedService.getEvaluationAverageByGrade(this.selectedSchoolYearID, this.selectedGradeLevel, this.selectedEvaluationSet)
    .subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data.length > 0) {
           this.gradeEvaluationData = res.data;
          // Ensure it's treated as a proper number
  const rawAverage = this.gradeEvaluationData[0].AvgScore;
  const average = Number(parseFloat(rawAverage).toFixed(1)); // keeps it numeric (e.g. 3.90 → 3.9)

  // If you want to always display 2 decimals like "3.90"
  //const displayAverage = parseFloat(rawAverage).toFixed(1); // string "3.90"

  console.log('Raw:', rawAverage);
  console.log('Formatted (number):', average);
  //console.log('Formatted (display):', displayAverage);

  this.renderRatingChart(average); 
        } else {
          this.gradeEvaluationData = [];
          this.renderRatingChart(0);
          console.error("Error ldi makuha data");
        }
      },
      error: (err) => {
        console.error("Error loading evaluation data:", err);
      }
    });
}

loadTrendAnalysis() {
  if (!this.selectedGradeLevel) {
    console.warn("No grade selected for trend analysis");
    return;
  }

  this.sharedService.getTrendAnalysisByGrade(this.selectedGradeLevel).subscribe({
    next: (res) => {
      if (res.status === 'success' && res.trend.length > 0) {
        this.trendData = res.trend;

        const labels = this.trendData.map((d: any) => d.SchoolYear);
        const values = this.trendData.map((d: any) => {
      const avg = parseFloat(d.AvgScore);
      return parseFloat(avg.toFixed(1)); // ensures numeric with 2 decimals
    });

    
        this.renderTrendAnalysis(labels, values);
        console.log(labels);
        

      } else {
        this.trendData = [];
        this.renderTrendAnalysis([], []);
      }
    },
    error: (err) => {
      console.error("Error loading trend analysis:", err);
    }
  });
}

loadEvaluationResponseCount() {
  this.sharedService
    .getEvaluationResponseCountByGrade(
      this.selectedSchoolYearID,
      this.selectedGradeLevel,
      this.selectedEvaluationSet
    )
    .subscribe({
      next: (res) => {
        if (res.status === 'success' && res.responses.length > 0) {
          // ✅ Assign only the integer value
          this.responseCount = res.responses[0].TotalEvaluations;
          console.log("✅ Evaluation Count:", this.responseCount);
        } else {
          // ✅ Reset to zero if no data
          this.responseCount = 0;
          console.warn("⚠️ No evaluations found.");
        }
      },
      error: (err) => {
        console.error("❌ Error fetching evaluation count:", err);
        this.responseCount = 0;
      }
    });
}

loadCategoryBreakdown() {
  this.sharedService
    .getEvaluationCategoryBreakdownByGrade(
      this.selectedSchoolYearID,
      this.selectedGradeLevel,
      this.selectedEvaluationSet
    )
    .subscribe({
      next: (res) => {
        if (res.status === 'success' && res.categories.length > 0) {
           this.categoryBreakdown = res.categories.map((cat: any) => ({
            ...cat,
            AvgScore: parseFloat(cat.AvgScore).toFixed(1) // ensures "5.0"
          }));

          console.log(res.overallAverage)
          console.log("📊 Category Breakdown:", this.categoryBreakdown);
          
        
        } else {
          this.categoryBreakdown = [];
          console.warn("⚠️ No category data found.");
        }
      },
      error: (err) => {
        console.error("❌ Error loading category breakdown:", err);
      }
    });
}


loadCounts() {
  // Fetch max students first
  this.sharedService.getStudCountbyGrade().subscribe({
    next: (res) => {
      if (res.status === 'success') {
        this.gradeCounts = res.counts;

        // After getting total students, fetch submissions
        this.loadSubmissionCounts();
      }
    },
    error: (err) => console.error('Error fetching student counts', err)
  });
}

loadSubmissionCounts() {
  this.sharedService.getSubmissionCountByGrade(this.selectedSchoolYearID, this.selectedEvaluationSet)
    .subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.submissionCounts = res.data.grades;

          // Once we have both counts, render chart
          this.renderChart();
        }
      },
      error: (err) => console.error('Error fetching submission counts', err)
    });
}
      openSidebar() {
        this.isSidebarOpen = true;
      }
      closeSidebar() {
        this.isSidebarOpen = false;
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
       goToTeacherReport() {
        this.router.navigate(['/view-teacher-report']);
      }

      // Chart Section
      renderRatingChart(avg: any) {
  const ctx = document.getElementById('ratingChart') as HTMLCanvasElement;

  const formattedAvg = parseFloat(avg).toFixed(1);
  const numericAvg = parseFloat(formattedAvg);

  const remaining = 5.0 - numericAvg;
  

  if (this.ratingChart) {
    this.ratingChart.destroy();
  }

  this.ratingChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["average"], // you can keep this, it won’t show in chart
      datasets: [
        {
          data: [formattedAvg, remaining],
          backgroundColor: ['#FACC15', '#E5E7EB'], // yellow for avg, gray for remainin
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

    
 renderTrendAnalysis(labels: string[], values: number[]) {
  const ctx = document.getElementById('trendChart') as HTMLCanvasElement;

  if (this.trendChart) {
    this.trendChart.destroy();
  }

  this.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels, 
      datasets: [
        {
          label: 'Average Score',
          data: values, 
          fill: true,
          borderColor: '#facc15',
          backgroundColor: 'rgba(250, 204, 21, 0.3)',
          tension: 0.8,
          pointRadius: 4,
          pointBackgroundColor: '#facc15'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true, // ✅ keeps same small chart look
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true
        },
        datalabels: {
          // ✅ control label position
          anchor: 'end', // <-- position reference (start, center, end)
          align: 'start',  // <-- actual placement inside bar
          formatter: (value: number) => value.toFixed(1),// shows "4.2"
          color: '#000',
          font: {
            weight: 'bold',
            size: 12
          }
        },
      },
      
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
             ticks: {
            stepSize: 1,
            padding: 10, // ✅ adds extra space between labels and chart area
            font: {
              size: 12
            }
          },
        },
        
      }
    }
  });
}


 renderChart() {
  const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;

  // Build chart data dynamically
  const chartData = this.grades.map(grade => {
    const submitted = this.submissionCounts[grade] ?? 0;
    const total = this.gradeCounts[grade] ?? 0;
    return total ? Math.round((submitted / total) * 100) : 0;
  });

  if (this.perfChart) this.perfChart.destroy();

  this.perfChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: this.grades.map(g => `Grade ${g}`),
      datasets: [{
        label: 'Participated',
        data: chartData,
        backgroundColor: ['#FDE68A', '#FCD34D', '#FDE68A', '#FCD34D'],
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: value => `${value}%` }
        },
        
      },
      plugins: {
        tooltip: { callbacks: { label: context => `${context.parsed.y}%` } },
        legend: { display: false },
        datalabels: {
          anchor: 'center',
          align: 'center',
          color: '#000',
          font: { weight: 'bold', size: 12 },
          formatter: (value: number) => `${value}%`
        }
      }
    }
  });
}

showLogoutModal = false;
  openLogoutModal() {
      this.showLogoutModal = true;
    }

    closeLogoutModal() {
      this.showLogoutModal = false;
    }

     logout(){
        this.sharedService.logout().subscribe(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        this.router.navigate(['/login']);
      });

      }

}
      

