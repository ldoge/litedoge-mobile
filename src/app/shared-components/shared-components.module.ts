import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ImportWalletComponent} from './import-wallet/import-wallet.component';
import {LoadWalletComponent} from './load-wallet/load-wallet.component';
import {ViewTransactionComponent} from './view-transaction/view-transaction.component';
import {GenerateWalletComponent} from './generate-wallet/generate-wallet.component';
import {DeleteWalletComponent} from './delete-wallet/delete-wallet.component';
import {TranslateModule} from '@ngx-translate/core';
import {SettingsComponent} from './settings/settings.component';


@NgModule({
  declarations: [
    ImportWalletComponent,
    LoadWalletComponent,
    ViewTransactionComponent,
    GenerateWalletComponent,
    DeleteWalletComponent,
    SettingsComponent,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ]
})
export class SharedComponentsModule {
}
