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

  getLoadButton() {
    return element(by.id('load'));
  }

  getUnloadButton() {
    return element(by.id('unload'));
  }
}
