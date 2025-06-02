import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public Fname?: string;
  public Mname?: string;
  public Lname?: string;  
  public Schoolid?: string;
  public Grade?: string;
  public Section?: string;
  public PhoneNumber?: string;
  constructor() { }
}
