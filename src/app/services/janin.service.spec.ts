import { TestBed } from '@angular/core/testing';

import { JaninService } from './janin.service';

describe('JaninService', () => {
  let service: JaninService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JaninService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
