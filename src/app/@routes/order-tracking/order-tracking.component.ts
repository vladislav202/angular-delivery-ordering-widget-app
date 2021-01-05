import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import { Apollo, QueryRef } from 'apollo-angular';
import { OrderByLinkDocument } from '@app/@core/graphql/operations/order/query.ops.g';
import { OrderFulfillmentDocument } from '@app/@core/graphql/operations/order/subscription.ops.g';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  private readonly subscriptions = [];

  orderDetailsQuery: QueryRef<any>;

  parentPath: any;
  slug = '';
  uniqueLink: any;
  order: any;
  store: any;
  customerName: any;
  isLoadingOrderDetail = false;
  isLoadingStoreDetail = false;

  counter: number;
  etaTimeUnit: any;
  currentLang: any;
  isShowErrorMessage = false;
  sourceInfluencer: string;

  constructor(private activatedRoute: ActivatedRoute,
    public apollo: Apollo,
    private router: Router,
    private translate:TranslateService) {
    const allParams = this.activatedRoute.snapshot.params;
    if (allParams && allParams.uniqueLink !== undefined) {
      this.uniqueLink = allParams.uniqueLink;
    }

    this.parentPath = sessionStorage.getItem('parentPath');
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
  }

  ngOnInit() {

    this.isLoadingOrderDetail = true;
    this.orderDetailsQuery = this.apollo.watchQuery({
      query: OrderByLinkDocument,
      variables: {
        uniqueLink: this.uniqueLink
      }
    });

    this.orderDetailsQuery.subscribeToMore({
      document: OrderFulfillmentDocument,
      variables: {
        order: this.uniqueLink,
      },
      updateQuery: (prev, {subscriptionData}) => {

        if (!subscriptionData.data) {
          return prev;
        }

        return prev;

      },
      onError: (err => console.error(err))
    })

    this.subscriptions.push(
      this.orderDetailsQuery.valueChanges.subscribe(({data, loading}) => {
        this.order = data.orderByLink;
        this.slug = this.order.catalog.slug;
        this.currentLang = this.order.customer.locale;
        this.translate.use(this.currentLang);

        document.documentElement.style.setProperty('--theme-color', this.order.catalog.widgetTextColor);
        document.documentElement.style.setProperty('--theme-background-color', this.order.catalog.widgetBackgroundColor);

        this.customerName = this.order.customerName;
        this.store = this.order.fulfillment.store;

        const currentDate = new Date();
        const eta = new Date(this.order.fulfillment.eta);

        const diff = Math.round(Math.abs(eta.getTime() - currentDate.getTime()));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        if(days) {
          if(hours) {
            this.counter = days + 1;
            this.etaTimeUnit = 'days';
          } else {
            this.counter = days;
            this.etaTimeUnit = 'days';
          }
        } else if(hours && !days) {
          if(hours > 3) {
            if(minutes) {
              this.counter = hours + 1;
              this.etaTimeUnit = 'hours';
            } else {
              this.counter = hours;
              this.etaTimeUnit = 'hours';
            }
          } else {
            this.counter = hours * 60 + minutes;
            this.etaTimeUnit = 'minutes';
          }
        } else if(minutes && !hours && !days) {
          this.counter = minutes;
          this.etaTimeUnit = 'minutes';
        } else {
          this.counter = null;
        }

        this.isLoadingOrderDetail = false;
        this.isShowErrorMessage = false;
      },
      (err) => {
        this.isLoadingOrderDetail = false;
        this.isShowErrorMessage = true;
      })
    );
  }

  trackOrder(order: any) {
    window.open(order.delivery.courier.trackingUrl, '_blank');
  }

  callUs() {
    document.location.href = "tel:+" + this.store.contacts[0].phoneNumberDetails.countryCode + this.store.contacts[0].phoneNumberDetails.nationalNumber;
  }

  getOrderType(type) {
    return (type === 'OrderPickupDelivery' ? 'Pickup' : 'Courier');
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
