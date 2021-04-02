import {TestBed} from '@angular/core/testing';

import {SingleWalletGeneratorService} from './single-wallet-generator.service';
import {LitedogeCurrency} from '../models/litedoge-currency';
import {StorageService} from './storage.service';
import {Storage} from '@ionic/storage';
import {SingleWallet} from '../models/single-wallet';
import {of} from 'rxjs';

describe('SingleWalletGeneratorService', () => {
  let service: SingleWalletGeneratorService;
  let litedogeCurrency: LitedogeCurrency;
  let savedWallet: SingleWallet;
  let storedWalletName: string;
  let storedWalletPassphrase: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Storage, StorageService],
    });
    litedogeCurrency = new LitedogeCurrency();
    storedWalletName = Math.random().toString();
    storedWalletPassphrase = Math.random().toString();

    service = TestBed.inject(SingleWalletGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate single wallet', () => {
    const wallet = service.generateNewAddressAndKey(litedogeCurrency);
    expect(wallet).toBeDefined();
  });

  it('should generate and save single wallet', async () => {
    savedWallet = service.generateNewAddressAndKey(litedogeCurrency);
    await expectAsync(service.encryptAndStoreWallet(savedWallet, storedWalletName, storedWalletPassphrase).toPromise()).not.toBeRejected();
  });

  it('should retrieve saved wallet', async () => {
    savedWallet = service.generateNewAddressAndKey(litedogeCurrency);

    spyOn(service, 'retrieveEncryptedWallet').and.callFake((currency, walletName, walletPassPhrase) => {
      return of(savedWallet).toPromise();
    });
    const retrievedWallet = await service.retrieveEncryptedWallet(litedogeCurrency, storedWalletName, storedWalletPassphrase);
    expect(retrievedWallet.litedogeAddress).toBe(savedWallet.litedogeAddress);
    expect(retrievedWallet.litedogeWifPrivateKey).toBe(savedWallet.litedogeWifPrivateKey);
  });
});
