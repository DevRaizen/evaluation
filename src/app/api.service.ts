import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private nlpUrl = "https://flask-sentiments-p26kj3e0s-devraizens-projects.vercel.app/";
  constructor(private http: HttpClient) {}

  analyzeText(feedbacks: string[]) {
    return this.http.post<any>(`${this.nlpUrl}analyze`, { feedbacks});
  }
  
}
