import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {IonicStorageModule} from '@ionic/storage-angular';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SharedComponentsModule} from './shared-components/shared-components.module';
import {BarcodeScannerWeb} from '@capacitor-community/barcode-scanner';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    SharedComponentsModule,
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    Storage,
    BarcodeScannerWeb,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
