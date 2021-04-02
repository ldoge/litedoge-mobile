import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {ImportWalletComponent} from './import-wallet/import-wallet.component';
import {LoadWalletComponent} from './load-wallet/load-wallet.component';
import {SaveWalletComponent} from './save-wallet/save-wallet.component';
import {ViewTransactionComponent} from './view-transaction/view-transaction.component';


@NgModule({
  declarations: [
    ImportWalletComponent,
    LoadWalletComponent,
    SaveWalletComponent,
    ViewTransactionComponent,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ]
})
export class SharedComponentsModule {
}
