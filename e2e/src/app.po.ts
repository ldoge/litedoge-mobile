import {browser, by, element} from 'protractor';
import {from, Observable} from 'rxjs';
import {first} from 'rxjs/operators';

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
}
