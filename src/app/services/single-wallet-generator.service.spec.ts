import {TestBed} from '@angular/core/testing';

import {SingleWalletGeneratorService} from './single-wallet-generator.service';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {StorageService} from './storage.service';
import {Storage} from '@ionic/storage';
import {SingleWallet} from '../models/single-wallet';

describe('SingleWalletGeneratorService', () => {
  let service: SingleWalletGeneratorService;
  let litedogeCurrency: LitedogeCurrency;
  let savedWallet: SingleWallet;
  let storedWalletName: string;
  let storedWalletPassphrase: string;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [Storage, StorageService],
    });
    litedogeCurrency = new LitedogeCurrency();
    storedWalletName = Math.random().toString();
    storedWalletPassphrase = Math.random().toString();

    service = TestBed.inject(SingleWalletGeneratorService);
  });

  it('1.0 should be created', () => {
    expect(service).toBeTruthy();
  });

  it('2.0 should generate single wallet', () => {
    const wallet = service.generateNewAddressAndKey(litedogeCurrency);
    expect(wallet).toBeDefined();
  });

  it('3.0 should generate and save single wallet', async () => {
    savedWallet = service.generateNewAddressAndKey(litedogeCurrency);
    await expectAsync(service.encryptAndStoreWallet(savedWallet, storedWalletName, storedWalletPassphrase).toPromise()).not.toBeRejected();
  });

  it('3.1 should retrieve saved wallet', async () => {
    const retrievedWallet = await service.retrieveEncryptedWallet(litedogeCurrency, storedWalletName, storedWalletPassphrase);
    expect(retrievedWallet.litedogeAddress).toBe(savedWallet.litedogeAddress);
    expect(retrievedWallet.litedogeWifPrivateKey).toBe(savedWallet.litedogeWifPrivateKey);
  });

  it('3.2 should delete saved wallet',  async() => {
    expect(service.deleteWallet(storedWalletName)).toBeUndefined();
    await expectAsync(service.retrieveEncryptedWallet(litedogeCurrency, storedWalletName, storedWalletPassphrase)).toBeRejectedWithError();
  });
});
