import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { OrderByLinkDocument } from '@app/@core/graphql/operations/order/query.ops.g';
import { OrderFulfillmentDocument } from '@app/@core/graphql/operations/order/subscription.ops.g';
import { environment } from '@environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-order-confirm',
  templateUrl: './order-confirm.component.html',
  styleUrls: ['./order-confirm.component.scss']
})
export class OrderConfirmComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  orderDetailsQuery: QueryRef<any>;
  slug = '';
  uniqueLink: any;
  order: any;
  parentPath: any;
  isLoadingOrderDetail = false;
  externalBaseLink: any;
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
    this.externalBaseLink = environment.externalBaseLink;
  }

  ngOnInit(): void {
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
        this.isLoadingOrderDetail = false;
        this.isShowErrorMessage = false;
      },
      (err) => {
        this.isLoadingOrderDetail = false;
        this.isShowErrorMessage = true;
      })
    );
  }

  trackingOrder() {
    if(this.parentPath) {
      this.router.navigate(['/', this.parentPath, this.slug, 'order-tracking', this.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate(['/', this.slug, 'order-tracking', this.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    }
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
