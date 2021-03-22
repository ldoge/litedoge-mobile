import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
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

  public async get(key: string) {
    return this.pStorage?.get(key);
  }

  public set(key: string, value: any) {
    this.pStorage?.set(key, value);
  }

  public async encryptedGet(key: string, passphrase: string): Promise<string> {
    const encryptedData = await this.pStorage?.get(key);
    const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public async encryptedSet(key: string, value: any, passphrase: string) {
    const encryptedData = CryptoJS.AES.encrypt(value, passphrase).toString();
    await this.pStorage?.set(key, encryptedData);
  }
}
