import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ImportWalletComponent} from './import-wallet/import-wallet.component';
import {LoadWalletComponent} from './load-wallet/load-wallet.component';
import {SaveWalletComponent} from './save-wallet/save-wallet.component';
import {ViewTransactionComponent} from './view-transaction/view-transaction.component';
import {GenerateWalletComponent} from './generate-wallet/generate-wallet.component';
import {DeleteWalletComponent} from './delete-wallet/delete-wallet.component';
import {TranslateModule} from '@ngx-translate/core';


@NgModule({
  declarations: [
    ImportWalletComponent,
    LoadWalletComponent,
    SaveWalletComponent,
    ViewTransactionComponent,
    GenerateWalletComponent,
    DeleteWalletComponent,
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
