import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataAPI = 'http://localhost:3000/budget';
  private budgetData: any[] = [];

  constructor(private http: HttpClient) { }

  fetchData(): Observable<any> {
    return this.http.get(this.dataAPI);
  }

  setData(data: any[]): void {
    this.budgetData = data;
  }

  getData(): any[] {
    return this.budgetData;
  }
}
