import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost/teacher-evaluation-backend/api.php';  

  constructor(private http: HttpClient) {}

  addUser(name: string, psw: string): Observable<any> {    
    return this.http.post<any>(this.apiUrl, { name, psw, action: 'register' }).pipe(
      catchError((error) => {
        const errorMessage = error?.error?.message || 'Something went wrong';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Login a user
  loginUser(username: string, password: string): Observable<any> {
    const body = { name: username, psw: password, action: 'login' }; // Adding login action
    return this.http.post<any>(this.apiUrl, body).pipe(
      catchError((error) => {
        const errorMessage = error?.error?.message || 'Something went wrong';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  // Logout a user
  logoutUser(): Observable<any> {
    const body = { action: 'logout' }; // Adding logout action
    return this.http.post<any>(this.apiUrl, body).pipe(
      catchError((error) => {
        const errorMessage = error?.error?.message || 'Something went wrong';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

}
