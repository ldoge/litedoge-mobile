import {AppPage} from './app.po';
import {map} from 'rxjs/operators';

describe('new App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display wallet title', async () => {
    await page.navigateTo();
    expect(await page.getPageTitle()).toContain('Wallet');
  });

  it('should display wallet card title', async () => {
    await page.navigateTo();
    expect(await page.getMainCardTitle()).toContain('LiteDoge Wallet');
  });

  it('should display wallet card generate button', async () => {
    await page.navigateTo();
    expect(await page.getGenerateButton().getText()).toContain('GENERATE');
  });

  it('should display wallet card unload button', async () => {
    await page.navigateTo();
    expect(await page.getUnloadButton().getText()).toContain('UNLOAD');
  });
});
