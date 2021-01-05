import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Apollo} from 'apollo-angular';
import { OrderByLinkDocument } from '@app/@core/graphql/operations/order/query.ops.g';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  parentPath: any;
  slug = '';
  uniqueLink: any;
  order: any;
  currentLang: any;

  isLoadingOrderDetail = false;
  isShowErrorMessage = false;
  sourceInfluencer: string;

  constructor(private activatedRoute: ActivatedRoute,
    public apollo: Apollo,
    private translate:TranslateService) {
    const allParams = this.activatedRoute.snapshot.params;
    if (allParams && allParams.uniqueLink !== undefined) {
      this.uniqueLink = allParams.uniqueLink;
    }

    this.parentPath = sessionStorage.getItem('parentPath');
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
  }

  ngOnInit(): void {
    if(this.uniqueLink) {
      this.orderDetail();
    }
  }

  orderDetail() {
    this.isLoadingOrderDetail = true;

    this.subscriptions.push(
      this.apollo.watchQuery({
        query: OrderByLinkDocument,
        variables: {uniqueLink: this.uniqueLink},
        fetchPolicy: 'no-cache',
      }).valueChanges.subscribe((result: any) => {
        this.order = result.data.orderByLink;
        this.currentLang = this.order.customer.locale;
        this.translate.use(this.currentLang);
        this.slug = this.order.catalog.slug;
        document.documentElement.style.setProperty('--theme-color', this.order.catalog.widgetTextColor);
        document.documentElement.style.setProperty('--theme-background-color', this.order.catalog.widgetBackgroundColor);
        this.order.productConnection.edges.map((product) => {
          let modifierItemsTotalPrice = 0;
          for(const modifier of product.node.modifierConnection.edges) {
            for(const modifierItem of modifier.node.optionConnection.edges) {
              modifierItemsTotalPrice += modifierItem.node.price * modifierItem.node.quantity;
            }
          }
          product.node.totalPrice = (product.node.price + modifierItemsTotalPrice) * product.node.quantity;
        })

        this.isLoadingOrderDetail = false;
        this.isShowErrorMessage = false;
      },
      (err) => {
        this.isLoadingOrderDetail = false;
        this.isShowErrorMessage = true;
      })
    );
  }

  getOrderType(type) {
    return (type === 'OrderPickupDelivery' ? 'Pickup' : 'Courier');
  }

  calculateSubtotalPrice(order: any) {
    let subTotalPrice = 0;

    for(const product of order.productConnection.edges) {
      subTotalPrice += product.node.totalPrice;
    }

    return subTotalPrice;
  }

  calculateDiscountValue(order: any) {
    let discountValue = 0;
    const subTotalPrice = this.calculateSubtotalPrice(order);
    const totalPrice = order.payment.amount;

    if(order.delivery.fee && order.delivery.fee !== 0) {
      const deliveryFee = order.delivery.fee;
      discountValue = subTotalPrice + deliveryFee - totalPrice;
    } else {
      discountValue = subTotalPrice - totalPrice;
    }
    return discountValue;
  }

  getPaymentMethod(order) {
    if(order.payment.__typename === 'OrderNewCardOnlinePayment' ||
      order.payment.__typename === 'OrderExistingCardOnlinePayment') {
      return 'Card online'
    } else if(order.payment.__typename === 'OrderOfflinePayment' &&
              order.payment.type === 'CARD' &&
              order.delivery.__typename === 'OrderPickupDelivery') {
      return 'Card on pickup'
    } else if(order.payment.__typename === 'OrderOfflinePayment' &&
              order.payment.type === 'CASH' &&
              order.delivery.__typename === 'OrderPickupDelivery') {
      return 'Cash on pickup'
    } else if(order.payment.__typename === 'OrderOfflinePayment' &&
              order.payment.type === 'CASH' &&
              order.delivery.__typename !== 'OrderPickupDelivery') {
      return 'Cash on delivery'
    } else if(order.payment.__typename === 'OrderOfflinePayment' &&
              order.payment.type === 'CARD' &&
              order.delivery.__typename !== 'OrderPickupDelivery') {
      return 'Card on delivery'
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
