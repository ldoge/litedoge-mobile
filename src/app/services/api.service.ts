import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {from, Observable} from 'rxjs';
import {HTTP} from '@ionic-native/http/ngx';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HTTP) {
  }

  public getEndpointHostUrl(): string {
    return environment.endpoint;
  }

  public get(path: string, data: { [param: string]: string }): Observable<any> {
    const options = {
      ...this.getJsonHeaders()
    };
    return from(this.http.get(this.getEndpointHostUrl() + path, data, options));
  }

  private getJsonHeaders() {
    return {
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    };
  }
}
