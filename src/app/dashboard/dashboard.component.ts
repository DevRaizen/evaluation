  import { Component, HostListener } from '@angular/core';
  import { ApiService } from '../api.service';
  import { Router } from '@angular/router';
  import { ChartOptions, ChartType, ChartData } from 'chart.js';
  import { Chart } from 'chart.js/auto';

  @Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
  })
  export class DashboardComponent {
    isSidebarOpen = false;
    public barChartType: ChartType = 'bar';
    public barChartPlugins = [];


    openSidebar() {
      this.isSidebarOpen = true;
    }
    closeSidebar() {
      this.isSidebarOpen = false;
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
  constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
     /* this.user = localStorage.getItem('userid');
      
      if (!this.user) {
        
        this.router.navigate(['/login']);
      }else{
        this.router.navigate(['/dashboard']);
      }
        */
    }

    toggleMenu()  
    {
    if(this.menuOpen == true){
      this.menuOpen = false;
    }else{
      this.menuOpen = true;
    }
    };

    Logout() {
      this.apiService.logoutUser().subscribe(
        (response) => {
          alert(response.message);  
          localStorage.removeItem('user');  
          this.router.navigate(['/login']);  
        },
        (error) => {
          console.error('Logout failed:', error);
        }
      );
    }
    
   
  }
