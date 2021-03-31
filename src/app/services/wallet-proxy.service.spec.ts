import { TestBed } from '@angular/core/testing';

import { WalletProxyService } from './wallet-proxy.service';

describe('WalletProxyService', () => {
  let service: WalletProxyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletProxyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
