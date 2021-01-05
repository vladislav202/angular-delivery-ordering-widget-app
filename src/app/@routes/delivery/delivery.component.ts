import { Component, OnInit, OnDestroy } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CatalogStoreConnectionGQL } from '@app/@core/graphql/operations/store/query.ops.g';
import {Apollo} from 'apollo-angular';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
})
export class DeliveryComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  pixelID: any;
  isLoadingStore = false;
  pickupEnableStoreList: any[] = [];
  deliveryEnableStoreList: any[] = [];
  catalogId: any;
  sourceInfluencer: string;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private catalogStoreConnectionGQL: CatalogStoreConnectionGQL,
    public apollo: Apollo
  ) {
    this.pixelID = sessionStorage.getItem('pixelID');
    this.catalogId = sessionStorage.getItem('catalogId');
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
   }

  ngOnInit(): void {
    this.catalogStoreConnection();
    if(this.pixelID) {
      this.trackingPages(this.pixelID);
    }
  }

  catalogStoreConnection() {
    this.isLoadingStore = true;
    this.subscriptions.push(
      this.catalogStoreConnectionGQL.watch({ id: this.catalogId })
      .valueChanges.subscribe(result => {
        const storeList = result.data.catalog.storeConnection.edges;
        this.pickupEnableStoreList = storeList.filter((store: any) => store.node.pickupEnabled === true);
        this.deliveryEnableStoreList = storeList.filter((store: any) => store.node.deliveryEnabled === true);
        this.isLoadingStore = false;
      })
    )
  }

  trackingPages(pixelID: any) {
    (function (f: any, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {n.callMethod ?
      n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
      if (!f._fbq) f._fbq = n;n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    (window as any).fbq('init', pixelID);
    (window as any).fbq('track', 'PageView');
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
