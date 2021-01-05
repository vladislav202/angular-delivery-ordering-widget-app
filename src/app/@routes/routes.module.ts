import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../@layout/layout.component';
import { HomeComponent } from '@app/@routes/home/home.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { LocationComponent } from '@app/@routes/delivery/location/location.component';
import { PickupComponent } from '@app/@routes/delivery/pickup/pickup.component';
import { CartComponent } from '@app/@routes/cart/cart.component';
import { OtpComponent } from '@app/@routes/otp/otp.component';
import { CheckoutComponent } from '@app/@routes/checkout/checkout.component';
import { OrderConfirmComponent } from './order-confirm/order-confirm.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          },
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },
  {
    path: 'f',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          }
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },
  {
    path: 'i',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          }
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },
  {
    path: 'm',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          }
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },
  {
    path: 'w',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          }
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },
  {
    path: 's',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          }
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },
  {
    path: 'e',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          }
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },
  {
    path: 'g',
    component: LayoutComponent,
    children: [
      {
        path: '', redirectTo: ':slug', pathMatch: 'full'
      },
      {
        path: ':slug',
        component: HomeComponent,
        children: [
          {
            path: 'product/:id',
            component: HomeComponent
          },
          {
            path: '',
            component: HomeComponent
          }
        ]
      },
      {
        path: ':slug/delivery',
        component: DeliveryComponent,
        children: [
          {
            path: '',
            component: LocationComponent
          },
          {
            path: 'pickup',
            component: PickupComponent
          },
        ]
      },
      {
        path: ':slug/cart',
        component: CartComponent,
      },
      {
        path: ':slug/otp',
        component: OtpComponent,
      },
      {
        path: ':slug/checkout',
        component: CheckoutComponent,
      },
      {
        path: ':slug/order-confirm/:uniqueLink',
        component: OrderConfirmComponent,
      },
      {
        path: ':slug/order-tracking/:uniqueLink',
        component: OrderTrackingComponent,
      },
      {
        path: ':slug/order-detail/:uniqueLink',
        component: OrderDetailComponent,
      }
    ]
  },

  // Not found
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class RoutesModule {
}
