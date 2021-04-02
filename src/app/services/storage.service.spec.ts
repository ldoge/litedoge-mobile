import {TestBed} from '@angular/core/testing';

import {StorageService} from './storage.service';
import {Storage} from '@ionic/storage';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Storage],
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
