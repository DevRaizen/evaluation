import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-gen-report',
  standalone: false,
  templateUrl: './gen-report.component.html',
  styleUrl: './gen-report.component.css'
})
export class GenReportComponent implements OnInit {
      isSidebarOpen = false;
      responseCount = 245;
      categoryBreakdown = [
        { label: 'Respect', score: 4.7 },
        { label: 'Professionalism', score: 4.6 },
        { label: 'Communication', score: 4.7 },
        { label: 'Punctuality', score: 4.5 },
        { label: 'Fairness', score: 4.6 },
        { label: 'Patience', score: 4.7 }
      ];


      constructor(private router: Router){  }
      
      ngOnInit(): void {
        this.renderRatingChart();
        this.renderTrendAnalysis();
        this.renderChart();
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

      // Chart Section
       renderRatingChart() {
        const ctx = document.getElementById('ratingChart') as HTMLCanvasElement;
      
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            datasets: [
              {
                data: [4.8, 5 - 4.8],
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

      selectedSchoolYear = '2024–2025';
      selectedGrade = 'All';
      selectedEvalForm = 'All';

      renderTrendAnalysis() {
          const ctx = document.getElementById('trendChart') as HTMLCanvasElement;

          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['2020', '2021', '2022', '2023', '2024'],
              datasets: [{
                label: 'Average Score',
                data: [2.2, 2.8, 4.1, 4.5, 4.8,],
                fill: true,
                borderColor: '#facc15',
                backgroundColor: 'rgba(250, 204, 21, 0.3)',
                tension: 0.8,
                pointRadius: 4,
                pointBackgroundColor: '#facc15'
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: true
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 5
                }
              }
            }
          });
        }
        
 renderChart() {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        datasets: [
          {
            label: 'Participated',
            data: [75, 80, 90, 65], // adjust to your real values
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
            max: 100,
            ticks:{
              callback:(value) => `${value}%` 
            }
          },
          
        },
        plugins: {
           tooltip: {
            callbacks: {
              /**
              label: function(context) {
                return `${context.parsed.y}%`;
              } * */
              label: (context) => `${context.parsed.y}%`
            }             
          },
          legend: {
            display: false
          }
        }
      }
    });
  }


}
      

