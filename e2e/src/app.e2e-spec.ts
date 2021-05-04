import {AppPage} from './app.po';
import * as enTranslation from '../../src/assets/i18n/en.json';

describe('new App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display wallet title', async () => {
    await page.navigateTo();
    expect(await page.getPageTitle()).toContain(enTranslation.wallet_page.title);
  });

  it('should display wallet card title', async () => {
    await page.navigateTo();
    expect(await page.getMainCardTitle()).toContain(enTranslation.wallet_page.card_title);
  });

  it('should display wallet card generate button', async () => {
    await page.navigateTo();
    expect(await page.getGenerateButton().getText()).toContain(enTranslation.wallet_page.card_generate_button);
  });

  it('should display wallet card unload button', async () => {
    await page.navigateTo();
    expect(await page.getUnloadButton().getText()).toContain(enTranslation.wallet_page.card_unload_button);
  });
});
