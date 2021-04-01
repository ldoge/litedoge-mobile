import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  public getEndpointHostUrl(): string {
    return environment.endpoint;
  }

  public get<T>(path: string, data: { [param: string]: string }): Observable<T> {
    let params = new HttpParams();
    for (const dataKey in data) {
      if (dataKey && data[dataKey]) {
        params = params.set(dataKey, data[dataKey]);
      }
    }
    const options = {
      headers: this.getJsonHeaders(),
      params,
    };
    return this.http.get<T>(this.getEndpointHostUrl() + path, options);
  }

  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    });
  }
}
