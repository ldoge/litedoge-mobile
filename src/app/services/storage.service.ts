import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private pStorage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    this.pStorage = await this.storage.create();
  }

  public get(key: string) {
    return this.pStorage?.get(key);
  }

  public set(key: string, value: any) {
    this.pStorage?.set(key, value);
  }

  public encryptedGet(key: string, passphrase: string): string {
    const encryptedData = this.pStorage?.get(key);
    const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public encryptedSet(key: string, value: any, passphrase: string) {
    const encryptedData = CryptoJS.AES.encrypt(value, passphrase).toString();
    this.pStorage?.set(key, encryptedData);
  }
}
