import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-teacher-view',
  standalone: false,
  templateUrl: './teacher-view.component.html',
  styleUrl: './teacher-view.component.css'
})
export class TeacherViewComponent implements OnInit{

  constructor(private router: Router){}
  isSidebarOpen = false;
  public barChartPlugins = [];
  openSidebar() {
      this.isSidebarOpen = true;
    }
  closeSidebar() {
      this.isSidebarOpen = false;
    }

  ngOnInit(): void {
    this.renderChart();
    this.renderRatingChart();
  }
  
  goToDashboard(){
        this.router.navigate(['/dashboard']);
    }
  goToManageUser() {
        this.router.navigate(['/manage-user']);
    }
  goToSubjectMap() {
        this.router.navigate(['/subject-map']);
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

  renderChart() {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Respect', 'Punctuality', 'Communication', 'Responsible', 'Professionalism'],
        datasets: [
          {
            label: 'Rating',
            data: [4, 4.5, 4, 4.3, 4.8], // adjust to your real values
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
