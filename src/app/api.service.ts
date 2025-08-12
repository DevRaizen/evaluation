import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost/teacher-evaluation-backend/api.php';  
  private nlpUrl = "http://127.0.0.1:5000";
  constructor(private http: HttpClient) {}



  logoutUser(): Observable<any> {
    const body = { action: 'logout' }; // Adding logout action
    return this.http.post<any>(this.apiUrl, body).pipe(
      catchError((error) => {
        const errorMessage = error?.error?.message || 'Something went wrong';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  analyzeText(text: string) {
    return this.http.post<any>(`${this.nlpUrl}/analyze`, { text });
  }
  
}
