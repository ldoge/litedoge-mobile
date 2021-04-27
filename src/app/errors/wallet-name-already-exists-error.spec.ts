import { WalletNameAlreadyExistsError } from './wallet-name-already-exists-error';

describe('WalletNameAlreadyExistsError', () => {
  it('should create an instance', () => {
    expect(new WalletNameAlreadyExistsError()).toBeTruthy();
  });
});
