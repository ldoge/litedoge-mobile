import {browser, by, element} from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getPageTitle() {
    return element(by.css('ion-title')).getText();
  }

  getMainCardTitle() {
    return element(by.css('ion-card-title')).getText();
  }

  getGenerateButton() {
    return element(by.id('generate'));
  }

  getUnloadButton() {
    return element(by.id('unload'));
  }

  getFabInitButton() {
    return element(by.id('fab-init'));
  }

  getFabDeleteButton() {
    return element(by.id('fab-delete'));
  }

  getFabStoreButton() {
    return element(by.id('fab-store'));
  }

  getFabLoadButton() {
    return element(by.id('fab-load'));
  }

  getFabImportButton() {
    return element(by.id('fab-import'));
  }

  getFabSettingsButton() {
    return element(by.id('fab-settings'));
  }
}
