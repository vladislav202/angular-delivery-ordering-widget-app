import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { XsrfInterceptor } from '@app/@core/interceptors/xsrf.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientXsrfModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: XsrfInterceptor,
      multi: true
    }
  ]
})
export class InterceptorsModule {
}
