import {AppPage} from './app.po';
import * as enTranslation from '../../src/assets/i18n/en.json';

describe('new App init page', () => {
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

  it('should display fab button', async () => {
    await page.navigateTo();
    expect(await page.getFabInitButton().isDisplayed()).toBe(true);
  });

  it('should not display other fab options', async () => {
    await page.navigateTo();
    expect(await page.getFabDeleteButton().isDisplayed()).toBe(false);
    expect(await page.getFabStoreButton().isDisplayed()).toBe(false);
    expect(await page.getFabLoadButton().isDisplayed()).toBe(false);
    expect(await page.getFabImportButton().isDisplayed()).toBe(false);
    expect(await page.getFabSettingsButton().isDisplayed()).toBe(false);
  });

  it('should have clickable fab button', async () => {
    await page.navigateTo();
    expect(await page.getFabInitButton().click()).toBeDefined();
  });

  it('should display other fab options after being clicked', async () => {
    await page.navigateTo();
    await page.getFabInitButton().click();

    expect(await page.getFabDeleteButton().isDisplayed()).toBe(true);
    expect(await page.getFabStoreButton().isDisplayed()).toBe(true);
    expect(await page.getFabLoadButton().isDisplayed()).toBe(true);
    expect(await page.getFabImportButton().isDisplayed()).toBe(true);
    expect(await page.getFabSettingsButton().isDisplayed()).toBe(true);
  });
});
