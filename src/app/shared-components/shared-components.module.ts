import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImportWalletComponent} from './import-wallet/import-wallet.component';
import {LoadWalletComponent} from './load-wallet/load-wallet.component';
import {SaveWalletComponent} from './save-wallet/save-wallet.component';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    ImportWalletComponent,
    LoadWalletComponent,
    SaveWalletComponent,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ]
})
export class SharedComponentsModule {
}
