import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {TabsPageRoutingModule} from './tabs-routing.module';

import {TabsPage} from './tabs.page';
import {LoadWalletComponent} from '../services/load-wallet/load-wallet.component';
import {SaveWalletComponent} from '../services/save-wallet/save-wallet.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule
  ],
  declarations: [
    TabsPage,
    LoadWalletComponent,
    SaveWalletComponent,
  ]
})
export class TabsPageModule {
}
