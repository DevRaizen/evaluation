  import { Component, HostListener, OnInit } from '@angular/core';
  import { ApiService } from '../api.service';
  import { Router } from '@angular/router';
  import { ChartOptions, ChartType, ChartData } from 'chart.js';
  import { Chart } from 'chart.js/auto';
import { SharedService } from '../shared.service';

  @Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
  })
  export class DashboardComponent implements OnInit {
    avatar?: any;
    studentcount: any = 0;
    teachercount: any = 0;
    isSidebarOpen = false;
    public barChartType: ChartType = 'bar';
    public barChartPlugins = [];

    constructor(private sharedService: SharedService, private router: Router) {
      this.avatar = this.sharedService.defaultAvatar;
     
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

    public barChartOptions: ChartOptions = {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
          },
          grid: {
            color: '#e5e7eb', // tailwind gray-200
          },
        },
        x: {
          
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            usePointStyle: true,
          },
        },
      },
      
    };
    
    public barChartData: ChartData<'bar'> = {
      labels: ['Respect', 'Professionalism', 'Communication'],
      datasets: [
        {
          label: '',
          data: [90, 65, 80],
          backgroundColor: ['#6C4EA0', '#F5C518', '#3CB371'], 
          borderRadius: 0,
          barThickness: 40,
        },
      ],
    };

    getBackgroundColor(index: number): string {
      const colors = this.barChartData.datasets[0]?.backgroundColor as string[] || [];
      return colors[index] || '#ccc';
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

    
   
  }
