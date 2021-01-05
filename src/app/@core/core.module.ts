import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from '@app/@shared/guards/module-import-guard';
import { SettingsService } from './services/settings/settings.service';
import { GraphqlModule } from '@app/@core/graphql/graphql.module';
import { InterceptorsModule } from '@app/@core/interceptors/interceptors.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GraphqlModule,
    InterceptorsModule
  ],
  providers: [
    SettingsService
  ],
  exports: [
    GraphqlModule,
    InterceptorsModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
