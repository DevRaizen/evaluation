import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { SharedService } from '../shared.service';
import { ApiService } from '../api.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDf, { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-teacher-report',
  standalone: false,
  templateUrl: './view-teacher-report.component.html',
  styleUrl: './view-teacher-report.component.css'
})
export class ViewTeacherReportComponent  implements OnInit{
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
  showLogoutModal = false;

  constructor(private sharedService: SharedService, private router: Router,private Sentiments:  ApiService,private sanitizer: DomSanitizer) {
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
                    this.router.navigate(['/view-teacher-report']);
                  
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

    
  openSidebar() {
      this.isSidebarOpen = true;
    }
  closeSidebar() {
      this.isSidebarOpen = false;
    }

  ngOnInit(): void {
    setTimeout(() => this.skipAnimation = false);
    Chart.register(ChartDataLabels);
    this.loadTeachers();
    this.getSchoolYear();
      this.sharedService.getPendingStudents().subscribe((res: any) => {
            if (res.status === 'success') {
              this.pendingList = res.data;
              console.log(this.pendingList)
            }
          });
         

    
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

getOverallAverage(): string {
  if (!this.teacherData || this.teacherData.length === 0) {
    return "0.0"; // no data case
  }

  const total = this.teacherData.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.AvgScore);
  }, 0);

  const average = total / this.teacherData.length;
  console.log(average,"itot")
  const trys = (Math.round((average + Number.EPSILON) * 10) / 10);
  console.log("ito try ko", trys)
  const roundedAverage = (Math.round((average + Number.EPSILON) * 10) / 10).toFixed(1);
  return roundedAverage // ensures 4 becomes "4.0"
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
            if (val >= 3.0) return '#eab308'; // yellow
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
          max: 4,
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

  const remaining = 4.0 - avg;

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
          backgroundColor: ['#eab308', '#E5E7EB'],
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

pdfBlobUrl: SafeResourceUrl | null = null;
showPDFPreview = false;

closePDFPreview() {
  this.showPDFPreview = false;
  this.pdfBlobUrl = null;
}

confirmDownload() {
  if (this.pdfBlobUrl) {
    const a = document.createElement('a');
    a.href = this.pdfBlobUrl as string;
    a.download = 'Faculty_Evaluation_Report.pdf';
    a.click();
  }
}


downloadPDFReport() {
  console.log('Step 0: start downloadPDFReport');

  try {
    const doc = new (jsPDf as any)('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // === HEADER BAR ===
    doc.setFillColor(140, 34, 36);
    doc.rect(0, 0, pageWidth, 30, 'F');

    // === LOGO ===
    const logoPath = '/stroselogo.png';
    try {
      doc.addImage(logoPath, 'PNG', 30, 5, 40, 20);
      console.log('Step 1: logo added');
    } catch (e) {
      console.warn('Logo not added (okay):', e);
    }

    // === TITLE ===
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(17);
    doc.text('Saint Rose of Lima Catholic School', pageWidth / 2 + 10, 15, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.text('Faculty Evaluation Summary Report', pageWidth / 2 + 10, 23, { align: 'center' });

    // === META DATA ===
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const schoolYearObj = this.SchoolYear?.find((sy: any) => sy.SchoolYearID === this.selectedSchoolYearID);
    const schoolYearLabel = schoolYearObj?.SchoolYear || 'N/A';
    const generatedDate = new Date().toLocaleString();

    let y = 45;
    const info = [
      ['School Year:', schoolYearLabel],
      ['Generated On:', generatedDate],
      ['Teacher Name: ',this.selectedTeacher.fullName]
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

    // === OVERALL RATING ===
    const avgRating = Number(this.getRatingAvg?.() || 0);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(140, 34, 36);
    doc.text('Overall Rating', 14, y);
    y += 8;

    doc.setFillColor(250, 243, 243);
    doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text(`${avgRating.toFixed(1)}`, pageWidth / 2, y + 20, { align: 'center' });
    y += 45;

    // === SUBMISSION SUMMARY ===
    const submitted = this.responseCount ?? 0;
    const expected = this.responseMax?? 0;

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(140, 34, 36);
    doc.text('Submission Summary', 14, y);
    y += 10;

    doc.setFont('times', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Evaluations Received: ${submitted}`, 20, y);
    y += 7;
    doc.text(`Expected Evaluations: ${expected}`, 20, y);
    y += 20;

    // === CATEGORY TABLE ===
    if (this.teacherData && this.teacherData.length > 0) {
      try {
        const tableBody = this.teacherData.map((c: any) => [
          c?.categoryName ?? 'N/A',
          `${Number(c?.AvgScore ?? 0).toFixed(1)}`
        ]);

        autoTable(doc, {
          startY: y + 5,
          head: [['Category', 'Average Score']],
          body: tableBody,
          theme: 'striped',
          styles: { font: 'times', fontSize: 10, halign: 'center' },
          headStyles: { fillColor: [140, 34, 36], textColor: [255, 255, 255] },
          margin: { left: 14, right: 14 }
        });

        if ((doc as any).lastAutoTable?.finalY) {
          y = (doc as any).lastAutoTable.finalY + 15;
        } else {
          y += (tableBody.length * 8) + 25;
        }
      } catch (e) {
        console.warn('autoTable failed (skipping table):', e);
      }
    }

    // === FEEDBACK SENTIMENTS ===
  doc.addPage();
y = 20;

doc.setFont('times', 'bold');
doc.setFontSize(14);
doc.setTextColor(140, 34, 36);
doc.text('Feedback Sentiment Analysis', 14, y);
y += 10;

// 🔹 Function to randomly pick up to 10 feedback items
const getRandomFeedbacks = (arr: string[], limit: number = 10): string[] => {
  if (!arr || arr.length === 0) return [];
  const shuffled = arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  return shuffled.slice(0, limit);
};

// 🔹 Randomly selected feedbacks
const randomPositives = getRandomFeedbacks(this.positiveFeedbacks ?? [], 10);
const randomNeutrals  = getRandomFeedbacks(this.neutralFeedbacks ?? [], 10);
const randomNegatives = getRandomFeedbacks(this.negativeFeedbacks ?? [], 10);

// 🔹 Column X positions
const colX = {
  positive: 14,
  neutral: pageWidth / 3 + 5,
  negative: (2 * pageWidth) / 3 + 5
};

doc.setFont('times', 'bold');
doc.setFontSize(16);
doc.setTextColor(34, 197, 94);
doc.text('Positive', colX.positive, y);

doc.setTextColor(234, 179, 8);
doc.text('Neutral', colX.neutral, y);

doc.setTextColor(239, 68, 68);
doc.text('Negative', colX.negative, y);

y += 6;

// === Handle each column independently ===
const columnY = { positive: y, neutral: y, negative: y };
doc.setFont('times', 'normal');
doc.setFontSize(12);
doc.setTextColor(0);

// Helper to draw text safely within column and handle page breaks per column
const drawFeedbacks = (feedbacks: string[], startX: number, key: 'positive' | 'neutral' | 'negative') => {
  for (let i = 0; i < feedbacks.length; i++) {
    const textLines = doc.splitTextToSize(`• ${feedbacks[i]}`, (pageWidth / 3) - 20);
    const neededHeight = textLines.length * 6 + 4; // 6 per line + small padding

    // Add page if near bottom
    if (columnY[key] + neededHeight > 270) {
      doc.addPage();
      columnY[key] = 20;

      // Re-draw header for that column
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      if (key === 'positive') doc.setTextColor(34, 197, 94);
      else if (key === 'neutral') doc.setTextColor(234, 179, 8);
      else doc.setTextColor(239, 68, 68);
      doc.text(key.charAt(0).toUpperCase() + key.slice(1), startX, columnY[key]);
      columnY[key] += 8;
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0);
    }

    // Write text
    doc.text(textLines, startX, columnY[key]);
    columnY[key] += neededHeight;
  }
};

// Draw each column separately
drawFeedbacks(randomPositives, colX.positive, 'positive');
drawFeedbacks(randomNeutrals, colX.neutral, 'neutral');
drawFeedbacks(randomNegatives, colX.negative, 'negative');

    // === FOOTER ===
    const totalPages = (doc as any).internal?.pages?.length || 1;
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

    // === PREVIEW PDF ===
    console.log('Step 4: Before blob generation');
    const blob = doc.output('blob');
    console.log('Step 5: Blob generated');

    const blobUrl = URL.createObjectURL(blob);
    console.log('Step 6: Blob URL created');

    this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.showPDFPreview = true;
    console.log('Step 7: show PDF preview:', this.showPDFPreview);
  } catch (err) {
    console.error('PDF generation error (outer):', err);
  }
}
}
