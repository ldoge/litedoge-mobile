import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import * as CryptoJS from 'crypto-js';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dataStorage$: BehaviorSubject<Storage> = new BehaviorSubject<Storage>(null);

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this.dataStorage$.next(await this.storage.create());
  }

  public getJsonObservable<T>(key: string): Observable<T> {
    return this.dataStorage$
      .pipe(
        filter(storageSystem => storageSystem !== null),
        switchMap<Storage, any>(storageSystem => {
          return from<any>(storageSystem.get(key));
        }),
        map<string, T>(data => {
          return JSON.parse(data || '[]');
        })
      );
  }

  public encryptedGetObservable(key: string, passphrase: string): Observable<string> {
    return this.dataStorage$
      .pipe(
        filter(storageSystem => storageSystem !== null),
        switchMap<Storage, any>(storageSystem => {
          return from<any>(storageSystem.get(key));
        }),
        map<any, string>(encryptedData => {
          const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
          return bytes.toString(CryptoJS.enc.Utf8);
        })
      );
  }

  public setJsonObservable<T>(key: string, value: T): Observable<any> {
    return this.dataStorage$
      .pipe(
        filter(storageSystem => storageSystem !== null),
        switchMap<Storage, any>(storageSystem => {
          return from<any>(storageSystem.set(key, JSON.stringify(value)));
        }),
      );
  }

  public encryptedSetObservable(key: string, value: any, passphrase: string): Observable<any> {
    const encryptedData = CryptoJS.AES.encrypt(value, passphrase).toString();

    return this.dataStorage$
      .pipe(
        filter(storageSystem => storageSystem !== null),
        switchMap<Storage, any>(storageSystem => {
          return from<any>(storageSystem.set(key, encryptedData));
        }),
      );
  }

  public removeObservable(key: string): Observable<any> {
    return this.dataStorage$
      .pipe(
        filter(storageSystem => storageSystem !== null),
        switchMap<Storage, any>(storageSystem => {
          return from<any>(storageSystem.remove(key));
        }),
      );
  }
}
