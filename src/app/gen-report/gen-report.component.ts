import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { SharedService } from '../shared.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDf from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
      selectedQID: any;
      avatar = ""
      
      selectedSchoolYear: any;
      isSidebarOpen = false;
      responseCount = 0;
      categoryBreakdown: any[] = [];
      // max
    grades = ['7', '8', '9', '10']; // grade keys as strings
    gradeCounts: { [key: string]: number } = {};
    submissionCounts: { [key: string]: number } = {};
    

      constructor(private router: Router, private sharedService: SharedService,private sanitizer: DomSanitizer){ 
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
        this.getAllQuestionnaireIDs()
        Chart.register(ChartDataLabels);
        setTimeout(() => {
          this.loadGradeEvaluation();
          this.loadTrendAnalysis()
          this.loadEvaluationResponseCount() 
          this.loadCategoryBreakdown()
          this.loadCounts()
        }, 500);
        this.sharedService.getPendingStudents().subscribe((res: any) => {
            if (res.status === 'success') {
              this.pendingList = res.data;
              console.log(this.pendingList)
            }
          });
        setTimeout(() => this.skipAnimation = false);
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

        questionnaires: { QID: number; QTitle: string }[] = [];
        getAllQuestionnaireIDs() {
        this.sharedService.getAllQuestionnaireIDs().subscribe({
          next: (res) => {
            console.log('All Questionnaires:', res); 
            this.questionnaires = res.map((q: any) => ({
              QID: q.QID,
              QTitle: q.QTitle // make sure your backend returns QTitle
            }));
               if (this.questionnaires.length > 0) {
                this.selectedQID = this.questionnaires[0].QID;
              } else {
                this.selectedQID = null;
              }
          },
          error: (err) => {
            console.error('Failed to fetch Questionnaires:', err);
          }
        });
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

   

gradeEvaluationData: any[] = [];
    loadGradeEvaluation() {
  this.sharedService.getEvaluationAverageByGrade(this.selectedSchoolYearID, this.selectedGradeLevel, this.selectedQID)
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
      this.selectedQID
    )
    .subscribe({
      next: (res) => {
        if (res.status === 'success' && res.responses.length > 0) {
          // ✅ Assign only the integer value
      this.responseCount = res.responses[0].TotalResponses;
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
      this.selectedQID
    )
    .subscribe({
      next: (res) => {
        if (res.status === 'success' && res.categories.length > 0) {
           this.categoryBreakdown = res.categories.map((cat: any) => ({
            ...cat,
            AvgScore: parseFloat(cat.AvgScore).toFixed(1) // ensures "5.0"
          }));

          console.log(res.overallAverage,"average category")
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
  this.sharedService.getStudCountbyGradereport(this.selectedSchoolYearID).subscribe({
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
  this.sharedService.getSubmissionCountByGrade(this.selectedSchoolYearID, this.selectedQID)
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
       goToTeacherReport() {
        this.router.navigate(['/view-teacher-report']);
      }

      // Chart Section
      renderRatingChart(avg: any) {
  const ctx = document.getElementById('ratingChart') as HTMLCanvasElement;

  const formattedAvg = parseFloat(avg).toFixed(1);
  const numericAvg = parseFloat(formattedAvg);

  const remaining = 4.0 - numericAvg;
  

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
          backgroundColor: ['#eab308', '#E5E7EB'], // yellow for avg, gray for remainin
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
          pointBackgroundColor: '#eab308'
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
          max: 4,
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
pdfBlobUrl: SafeResourceUrl | null = null;
  showPDFPreview = false;
  
  downloadPDFReport() {
    const doc = new jsPDf('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // === HEADER BAR ===
    doc.setFillColor(140, 34, 36); // #8C2224
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
    doc.text('Faculty Evaluation Summary Report', pageWidth / 2 + 10, 23, { align: 'center' });

    // === METADATA SECTION ===
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const schoolYearObj = this.SchoolYear?.find((sy: any) => sy.SchoolYearID === this.selectedSchoolYearID);
    const schoolYearLabel = schoolYearObj?.SchoolYear || schoolYearObj?.SchoolYearName || 'N/A';

    const evalFormObj = this.questionnaires?.find((es: any) => es.QID === this.selectedQID);
    const evalFormLabel = evalFormObj?.QTitle || 'N/A';

    const gradeLevel = this.selectedGradeLevel || 'All';
    const generatedDate = new Date().toLocaleString();

    let y = 45;
    const info = [
      ['School Year:', schoolYearLabel],
      ['Evaluation Form:', evalFormLabel],
      ['Grade Level:', gradeLevel],
      ['Generated On:', generatedDate]
    ];

    info.forEach(([label, value]) => {
      doc.setFont('times', 'bold');
      doc.text(label, 14, y);
      doc.setFont('times', 'normal');
      doc.text(value, 60, y);
      y += 7;
    });

    doc.setDrawColor(140, 34, 36);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;

    // === AVERAGE RATING OVERVIEW ===
    const avgRating = this.getRatingAvg?.() || 0;
    const numericAvg = Number(avgRating) || 0;

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(140, 34, 36);
    doc.text('Average Rating Overview', 14, y);
    y += 8;

    doc.setDrawColor(140, 34, 36);
    doc.setFillColor(250, 243, 243);
    doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text(`${numericAvg.toFixed(1)}`, pageWidth / 2, y + 20, { align: 'center' });
    y += 45;

    if (this.trendChart) {
      const trendImg = this.trendChart.toBase64Image();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(140, 34, 36);
      doc.text('Trend Overview', 14, y);
      y += 5;
      doc.addImage(trendImg, 'PNG', 14, y, pageWidth - 28, 60);
      y += 70;
    }

    if (this.categoryBreakdown?.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('Category Breakdown', 14, y);
      y += 3;

      const tableBody = (this.categoryBreakdown ?? []).map((c: any) => [
        c?.CategoryName ?? c?.Category ?? 'N/A',
        `${Number(c?.AvgScore ?? 0).toFixed(1)}`
      ]);

      autoTable(doc, {
        startY: y + 5,
        head: [['Category', 'Average Score']],
        body: tableBody,
        theme: 'striped',
        styles: { font: 'times', fontSize: 10, halign: 'center', valign: 'middle' },
        headStyles: { fillColor: [140, 34, 36], textColor: [255, 255, 255] },
        margin: { left: 14, right: 14 }
      });
    }

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

    // === PREVIEW INSTEAD OF DOWNLOAD ===
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
      a.download = 'Faculty_Evaluation_Report.pdf';
      a.click();
    }
  }

}
      

