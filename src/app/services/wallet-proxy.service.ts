import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SingleWallet} from '../models/single-wallet';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WalletProxyService {

  constructor(private http: HttpClient) {
  }

  public getWalletProxyEndpoint(): string {
    return environment.walletProxyEndpoint;
  }

  public getUnspent(wallet: SingleWallet): Observable<any> {
    const options = {
      headers: this.getJsonHeaders()
    };
    return this.http.get<any>(this.getWalletProxyEndpoint() + '/addresses/' + wallet.litedogeAddress + '/unspent', options);
  }

  public pushTransactionHex(transactionHex: string): Observable<any> {
    const options = {
      headers: this.getJsonHeaders()
    };
    const data = {
      transactionHex
    };
    return this.http.post<any>(this.getWalletProxyEndpoint() + '/transactions/push', data, options);
  }

  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    });
  }
}
