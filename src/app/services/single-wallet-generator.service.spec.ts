import {TestBed} from '@angular/core/testing';

import {SingleWalletGeneratorService} from './single-wallet-generator.service';

describe('SingleWalletGeneratorService', () => {
  let service: SingleWalletGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SingleWalletGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
