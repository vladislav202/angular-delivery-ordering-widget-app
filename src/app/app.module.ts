import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch';
import { EntityDataModule } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { environment } from '@environments/environment';
import { CoreModule } from './@core/core.module';
import { LayoutModule } from './@layout/layout.module';
import { RoutesModule } from './@routes/routes.module';
import { AppComponent } from './app.component';
import { entityConfig } from './entity-metadata';
import { DeliveryComponent } from '@app/@routes/delivery/delivery.component';
import { LocationComponent } from './@routes/delivery/location/location.component';
import { PickupComponent } from './@routes/delivery/pickup/pickup.component';
import { HomeComponent } from '@app/@routes/home/home.component';
import { CartComponent } from './@routes/cart/cart.component';
import { OtpComponent } from './@routes/otp/otp.component';
import { CheckoutComponent } from './@routes/checkout/checkout.component';
import { OrderConfirmComponent } from './@routes/order-confirm/order-confirm.component';
import { OrderTrackingComponent } from './@routes/order-tracking/order-tracking.component';
import { OrderDetailComponent } from './@routes/order-detail/order-detail.component';
import { XSRF_HEADER_NAME } from '@app/@core/interceptors/xsrf.interceptor';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DeliveryComponent,
    LocationComponent,
    PickupComponent,
    CartComponent,
    OtpComponent,
    CheckoutComponent,
    OrderConfirmComponent,
    OrderTrackingComponent,
    OrderDetailComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot(),
    EntityDataModule.forRoot(entityConfig),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB4tqFq6eLwPZMF3ZFNsQswGPg0Q0czRpc',
      libraries: ['places', 'drawing', 'geometry']
    }),

    NgbModule,

    CoreModule,
    LayoutModule,
    RoutesModule,
    MatRadioModule,
    MatCheckboxModule,
    UiSwitchModule,
    NgxIntlTelInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'en',
    })
  ],
  providers: [
    HttpClientModule,
    {
      provide: XSRF_HEADER_NAME,
      useValue: environment.security.xsrf.header
    },
    GoogleMapsAPIWrapper,
    DatePipe
  ],
  // bootstrap: [ AppComponent ],
  entryComponents: [AppComponent]
})
export class AppModule {
  constructor(
    private injector: Injector,
    private router: Router,
    private location: Location
  ) {
    const appElement = createCustomElement(AppComponent, {
      injector: this.injector
    });

    customElements.define('order-widget', appElement);

    // init router with starting path
    this.router.navigateByUrl(this.location.path(true));

    // on every route change tell router to navigate to defined route
    this.location.subscribe(data => {
      this.router.navigateByUrl(data.url);
    });
  }

  ngDoBootstrap() {}
}
