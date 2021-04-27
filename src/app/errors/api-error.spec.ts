import { ApiError } from './api-error';

describe('ApiError', () => {
  it('should create an instance', () => {
    expect(new ApiError()).toBeTruthy();
  });
});
