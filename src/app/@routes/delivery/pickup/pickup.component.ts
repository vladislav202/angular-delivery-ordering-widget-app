import { Component, OnInit, OnDestroy } from '@angular/core';
import {Apollo} from 'apollo-angular';
import { CatalogStoreConnectionGQL } from '@app/@core/graphql/operations/store/query.ops.g';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.component.html',
  styleUrls: ['./pickup.component.scss']
})
export class PickupComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  catalogId: any;
  storeList: any[] = [];
  storeIds: any[] = [];
  filteredStoreList: any = [];
  slug = '';
  isLoadingStore = false;
  parentPath: any;
  catalogWidgetTheme: any;
  sourceInfluencer: string;

  constructor(
    private catalogStoreConnectionGQL: CatalogStoreConnectionGQL,
    public apollo: Apollo,
    private router: Router
  ) {
    this.catalogId = sessionStorage.getItem('catalogId');
    this.slug = sessionStorage.getItem('slug');
    this.parentPath = sessionStorage.getItem('parentPath');
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
    this.catalogWidgetTheme = JSON.parse(sessionStorage.getItem('catalogWidgetTheme'));
    document.documentElement.style.setProperty('--theme-color', this.catalogWidgetTheme.widgetTextColor);
    document.documentElement.style.setProperty('--theme-background-color', this.catalogWidgetTheme.widgetBackgroundColor);
  }

  ngOnInit(): void {
    this.catalogStoreConnection();
  }

  catalogStoreConnection() {
    this.isLoadingStore = true;
    this.subscriptions.push(
      this.catalogStoreConnectionGQL.watch({ id: this.catalogId })
      .valueChanges.subscribe(result => {
        this.storeList = result.data.catalog.storeConnection.edges;
        this.storeList.map((item) => {
          this.storeIds.push(item.node.id);
        });
        this.filteredStoreList = this.storeList;
        this.isLoadingStore = false;
      })
    )
  }

  selectStore(store: any) {
    sessionStorage.setItem('orderType', 'pickup');
    sessionStorage.setItem('storeId', store.node.id);
    sessionStorage.setItem('paymentMethod', '');
    sessionStorage.setItem('onlineCardType', '');
    if(this.parentPath) {
      this.router.navigate(['/', this.parentPath, this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate(['/', this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredStoreList = this.storeList.filter((item: any) =>
      item.node.name.trim().toLowerCase().includes(filterValue.trim().toLowerCase()));
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
