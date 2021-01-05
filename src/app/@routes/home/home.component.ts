import {AfterViewInit, Component, ViewChild, TemplateRef, OnDestroy, OnInit} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {Apollo} from 'apollo-angular';
import { CatalogDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { CatalogWidgetThemeDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { CatalogProductsWithAvailabilityDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { CatalogProductsWithoutAvailabilityDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { CatalogDiscountsDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreLookupByIdDocument } from '@app/@core/graphql/operations/store/query.ops.g';
import { CatalogStoreConnectionDocument } from '@app/@core/graphql/operations/store/query.ops.g';
import { CatalogTrackingPixelsDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { ActiveLoyaltyPointsDocument } from '@app/@core/graphql/operations/loyalty/query.ops.g';
import { TIMES_DATA } from '@app/@shared/mock-data/time-data';
import {TranslateService} from '@ngx-translate/core';
import { AddDiscountsToCartDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { RemoveDiscountsFromCartDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';

import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { CreateCartDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { AddCartProductDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { CatalogProductDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';

declare var $: any;

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly subscriptions = [];
  @ViewChild('productDetailModal') productDetailModal: TemplateRef<any>;

  parentPath: any;
  onScrollFn;

  catInView = 0;

  mode = '';
  modeTimeWhen = 'today';
  timesData: any[] = [];
  todayPreOrderTimes: any[] = [];
  tomorrowPreOrderTimes: any[] = [];

  orderType: any;
  categoryList: any[];
  catalog: any;
  slug = '';
  catalogId: any;
  currency: any;
  store: any;
  storeId: any;
  cart: any = null;
  deliveryAddress = '';
  minOrderDeliveryZone: any = null;
  isLoadingCatalogDetail = false;
  isLoadingStore = false;
  addressNotification = '';
  isShowErrorMessage = false;
  discountList: any[] = [];
  selectedDiscount: any;
  isEnableOrdering = true;
  isClosedStore = false;
  orderTiming = '';
  isPreOrder = false;

  descriptionWordsLimit = 130;
  completeWords = true;
  selectedCategory: any;
  loyaltyProgram: any;
  categoryNamesListForFiltering = [];
  activeLoyaltyProgramPoints: any;
  customerId: any;
  pickupEnableStoreList: any[] = [];
  deliveryEnableStoreList: any[] = [];
  isAddingDiscountToCart = false;

  product: any;
  productId: any;
  isLoadingProductDetail = false;
  showProductShortDesciption = true;
  itemQuantity = 1;
  isCreatingCart = false;
  isInvalidMandatoryModifiers = false;
  selectedModifierItems: any[] = [];
  modifiersList: any[] = [];

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  sourceInfluencer: string;

  private geoCoder;

  constructor(
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public apollo: Apollo,
    private _snackBar: MatSnackBar,
    private translate:TranslateService
  ) {
    this.productId = this.activatedRoute.snapshot.firstChild.params.id;
    if(this.productId) {
      this.productDetail();
    }

    this.activatedRoute.params.subscribe(params => {
      this.slug = params.slug;
      const previousSlug = sessionStorage.getItem('slug');
      if(this.slug !== previousSlug) {
        sessionStorage.setItem('slug', this.slug);
        sessionStorage.setItem('paymentMethod', '');
        sessionStorage.setItem('onlineCardType', '');
        sessionStorage.setItem('deliveryAddress', '');
      }
    });
  }

  ngOnInit(): void {
    if(sessionStorage.getItem('cart') !== '') {
      this.cart = JSON.parse(sessionStorage.getItem('cart'));
    }
    this.orderType = sessionStorage.getItem('orderType');
    this.deliveryAddress = sessionStorage.getItem('deliveryAddress');
    this.minOrderDeliveryZone = JSON.parse(sessionStorage.getItem('minOrderDeliveryZone'));
    this.parentPath = sessionStorage.getItem('parentPath');
    this.isPreOrder = JSON.parse(sessionStorage.getItem('isPreOrder')) ? JSON.parse(sessionStorage.getItem('isPreOrder')) : false;
    this.orderTiming = sessionStorage.getItem('orderTiming');
    this.customerId = localStorage.getItem('customerId');
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');

    this.timesData = TIMES_DATA;

    this.catalogDetail();
    this.setCatalogWidgetTheme();
    this.getCatalogPickupAddress();

    this.catalogDiscountsList();
    this.getCatalogTrackingPixels();
  }

  changeLang(language: any) {
    this.translate.use(language);
    localStorage.setItem('lang', language);
  }

  get flag() {
    return {en: 'United-Kingdom', it: 'Italy'}[this.translate.currentLang];
  }

  catalogDetail() {
    this.isLoadingCatalogDetail = true;
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogDocument,
        variables: {
          slug: this.slug
        },
      }).valueChanges.subscribe((result:any) => {
        this.catalog = result.data.catalog;
        if(this.catalog === null) {
          this.isShowErrorMessage = true;
          this.isLoadingCatalogDetail = false;
          this.isLoadingStore = false;
        } else {
          this.currency = this.catalog.currency.code;
          this.catalogId = this.catalog.id;
          this.loyaltyProgram = this.catalog.loyaltyProgram;
          if(this.customerId && this.loyaltyProgram) {
            this.getActiveLoyaltyPoints();
          }
          sessionStorage.setItem('currency', this.catalog.currency.code);
          sessionStorage.setItem('catalogId', this.catalog.id);
          sessionStorage.setItem('loyaltyProgram', JSON.stringify(this.catalog.loyaltyProgram));

          if(this.cart !== null && this.cart.catalog !== this.catalogId) {
            sessionStorage.setItem('cart', '');
            sessionStorage.setItem('cartId', '');
            this.cart = null;
          }

          this.isLoadingCatalogDetail = false;
        }
      },
      (err) => {
        this.isShowErrorMessage = true;
        this.isLoadingCatalogDetail = false;
        this.isLoadingStore = false;
      })
    )
  }

  setCatalogWidgetTheme() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogWidgetThemeDocument,
        variables: {
          slug: this.slug
        },
      }).valueChanges.subscribe((result:any) => {
        const catalogWidgetTheme = result.data.catalog;
        sessionStorage.setItem('catalogWidgetTheme', JSON.stringify(catalogWidgetTheme));
        document.documentElement.style.setProperty('--theme-color', catalogWidgetTheme.widgetTextColor);
        document.documentElement.style.setProperty('--theme-background-color', catalogWidgetTheme.widgetBackgroundColor);
      })
    )
  }

  catalogProductsListWithAvailability() {
    this.categoryNamesListForFiltering = [];
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogProductsWithAvailabilityDocument,
        variables: {
          slug: this.slug,
          store: this.storeId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result:any) => {

        this.categoryList = result.data.catalog.categoryConnection.edges;

        this.categoryList.map((category) => {
          category.node.productConnection.edges.sort((item1, item2) => item1.node.position - item2.node.position);
        });
        this.categoryList.sort((item1, item2) => item1.node.position - item2.node.position);

        this.categoryList.map((category) => {
          category.node.availableProductLength = category.node.productConnection.edges.filter((product) => {
            return product.node.availability[0].value === true;
          }).length;
          if(category.node.availableProductLength > 0) {
            this.categoryNamesListForFiltering.push(category);
          }
        })
      })
    )
  }

  catalogProductsListWithoutAvailability() {
    this.isLoadingStore = true;
    this.categoryNamesListForFiltering = [];
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogProductsWithoutAvailabilityDocument,
        variables: {
          slug: this.slug
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result:any) => {
        this.categoryList = result.data.catalog.categoryConnection.edges;

        this.categoryList.map((category) => {
          category.node.productConnection.edges.sort((item1, item2) => item1.node.position - item2.node.position);
        });
        this.categoryList.sort((item1, item2) => item1.node.position - item2.node.position);

        this.categoryList.map((category) => {
          category.node.availableProductLength = category.node.productConnection.edges.length;
        });
        this.categoryNamesListForFiltering = this.categoryList;

        if(this.orderType === 'delivery' && (this.deliveryAddress === '' || this.deliveryAddress === null)) {
          this.addressNotification = 'Please select a delivery address';
        }

        if((this.deliveryAddress === '' || this.deliveryAddress === null) ||
          (this.orderType === 'pickup' && this.store && this.store.pickupEnabled === false) ||
          (this.orderType === 'delivery' && this.store && this.store.deliveryEnabled === false) ||
          (this.isClosedStore && (this.orderType === 'pickup' || this.orderType === 'delivery')) ||
          (!this.store) ||
          (this.store && this.store.deliveryEnabled && !this.minOrderDeliveryZone && this.orderType === 'delivery'))
        {
          this.isEnableOrdering = false;
        }

        this.isLoadingStore = false;
      })
    )
  }

  catalogDiscountsList() {
    let autoDiscounts = [];
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogDiscountsDocument,
        variables: {
          slug: this.slug,
          customer: this.customerId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result:any) => {
        this.discountList = result.data.catalog.discountConnection.edges;
        if(this.discountList.length !== 0) {
          autoDiscounts = this.discountList.filter((item) => item.node.applicationType === 'AUTO');
        }

        const appliedDiscount = JSON.parse(sessionStorage.getItem('appliedDiscount'));

        if(appliedDiscount && this.discountList.filter((item) => item.node.id === appliedDiscount.discount.node.id).length > 0) {
          if(appliedDiscount.catalogId === this.catalogId) {
            this.discountList.map((item) => {
              if(item.node.id === appliedDiscount.discount.node.id) {
                item.node.applied = true;
              } else {
                item.node.applied = false;
              }
            })
          } else {
            sessionStorage.setItem('appliedDiscount', JSON.stringify(null));
          }
        } else {
          if(autoDiscounts.length !== 0) {
            autoDiscounts[0].node.applied = true;

            const appliedAutoDiscount = {
              catalogId: this.catalogId,
              discount: autoDiscounts[0]
            };
            sessionStorage.setItem('appliedDiscount', JSON.stringify(appliedAutoDiscount));
          } else {
            sessionStorage.setItem('appliedDiscount', JSON.stringify(null));
          }
        }
      })
    )
  }

  getActiveLoyaltyPoints() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: ActiveLoyaltyPointsDocument,
        variables: {
          loyaltyProgram: this.loyaltyProgram.id,
          customer: this.customerId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result: any) => {
        this.activeLoyaltyProgramPoints = result.data.activeLoyaltyPoints;
      })
    )
  }

  getCatalogPickupAddress() {
    this.isLoadingStore = true;
    let availableStoreList = [];
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogStoreConnectionDocument,
        variables: {
          slug: this.slug
        },
      }).valueChanges.subscribe((result:any) => {
        const storeList = result.data.catalog.storeConnection.edges;
        this.pickupEnableStoreList = storeList.filter((store: any) => store.node.pickupEnabled === true);
        this.deliveryEnableStoreList = storeList.filter((store: any) => store.node.deliveryEnabled === true);
        availableStoreList = result.data.catalog.storeConnection.edges.filter((store: any) => (store.node.pickupEnabled === true || store.node.deliveryEnabled === true));
        if(availableStoreList.length !== 0) {
          const cacheStoreId = sessionStorage.getItem('storeId');
          if(availableStoreList.filter((store: any) => store.node.id === cacheStoreId).length > 0) {
            this.storeId = cacheStoreId;
          } else {
            this.storeId = availableStoreList[0].node.id;
          }
        }
        if(this.storeId) {
          sessionStorage.setItem('storeId', this.storeId);
          this.catalogProductsListWithAvailability();
          this.getOrderTiming();
        } else {
          this.orderType = '';
          sessionStorage.setItem('orderType', '');
          sessionStorage.setItem('deliveryAddress', '');
          sessionStorage.setItem('storeId', '');
          sessionStorage.setItem('store', JSON.stringify(null));
          this.deliveryAddress = '';
          this.store = null;
          this.storeId = '';
          this.catalogProductsListWithoutAvailability();

          if((this.deliveryAddress === '' || this.deliveryAddress === null) ||
            (this.orderType === 'pickup' && this.store && this.store.pickupEnabled === false) ||
            (this.orderType === 'delivery' && this.store && this.store.deliveryEnabled === false) ||
            (this.isClosedStore && (this.orderType === 'pickup' || this.orderType === 'delivery')) ||
            (!this.store) ||
            (this.store && this.store.deliveryEnabled && !this.minOrderDeliveryZone && this.orderType === 'delivery'))
          {
            this.isEnableOrdering = false;
          }

          this.isLoadingStore = false;
        }
      })
    )
  }

  checkProductIsAddedToCart(product) {
    if(this.cart) {
      let addedProduct: any = null;
      addedProduct = this.cart.products.find((item) => item.catalogProduct === product.node.id);
      if(addedProduct) return true;
    } else {
      return false;
    }
  }

  getNumberOfProductsAddedToCart(product) {
    let addedProducts: any = [];
    let productCounts = 0;
    if(this.cart) {
      addedProducts = this.cart.products.filter((item) => item.catalogProduct === product.node.id);
      if(addedProducts.length > 0) {
        for(const product of addedProducts) {
          productCounts += product.quantity;
        }
        return productCounts;
      }
    }
  }

  applyDiscount(discount: any) {
    discount.node.applied = true;
    const appliedDiscount = {
      catalogId: this.catalogId,
      discount
    };
    this.discountList.map((item) => {
      if(item.node.id === discount.node.id) {
        item.node.applied = true;
      } else {
        item.node.applied = false;
      }
    });
    if(this.cart && this.cart.discount) {
      this.removeDiscount();
    }
    sessionStorage.setItem('appliedDiscount', JSON.stringify(appliedDiscount));
    this.closeModal();
  }

  removeDiscount() {
    const cartId = sessionStorage.getItem('cartId');
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: RemoveDiscountsFromCartDocument,
        variables: {
          cart: cartId,
          discounts: [this.cart.discount.discount.node.id]
        }
      }).subscribe((result: any) => {
        this.cart.discount = null;
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
      })
    );
  }

  getCatalogTrackingPixels() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogTrackingPixelsDocument,
        variables: {
          slug: this.slug
        },
      }).valueChanges.subscribe((result: any) => {
        const trackingPixels = result.data.catalog.trackingPixels;
        if(trackingPixels.length !== 0) {
          const pixelID = trackingPixels[0].data;
          sessionStorage.setItem('pixelID', pixelID);
          this.trackingPages(pixelID);
        }
      })
    )
  }

  getAvailableTimesForPreOrder (todayWorkingHour: any, tomorrowWorkingHour: any) {
    const today = new Date();
    const day = today.getDay();
    const hour = today.getHours();
    const minutes = today.getMinutes();
    const todayTime = hour + ':' + minutes;

    if(todayWorkingHour) {
      if(this.minutesOfDay(todayWorkingHour.timePeriods[0].from) < this.minutesOfDay(todayTime) &&
      this.minutesOfDay(todayWorkingHour.timePeriods[0].to) > this.minutesOfDay(todayTime)) {
        this.todayPreOrderTimes = this.timesData.filter((item) =>
          this.minutesOfDay(item.value) > this.minutesOfDay(todayTime) && this.minutesOfDay(item.value) <= this.minutesOfDay(todayWorkingHour.timePeriods[0].to));
        this.todayPreOrderTimes.unshift({time: "ASAP", value: "asap"});
      } else if(this.minutesOfDay(todayWorkingHour.timePeriods[0].from) > this.minutesOfDay(todayTime)) {
        this.todayPreOrderTimes = this.timesData.filter((item) =>
          this.minutesOfDay(item.value) >= this.minutesOfDay(todayWorkingHour.timePeriods[0].from) && this.minutesOfDay(item.value) <= this.minutesOfDay(todayWorkingHour.timePeriods[0].to));
      }
    }
    if(tomorrowWorkingHour) {
      this.tomorrowPreOrderTimes = this.timesData.filter((item) =>
        this.minutesOfDay(item.value) >= this.minutesOfDay(tomorrowWorkingHour.timePeriods[0].from) && this.minutesOfDay(item.value) <= this.minutesOfDay(tomorrowWorkingHour.timePeriods[0].to));
    }
  }

  selectPreOrderTime(time: any, day: any) {
    if(time !== 'asap') {
      const deliveryTime = this.timeConvert(this.minutesOfDay(time));
      sessionStorage.setItem('isPreOrder', JSON.stringify(true));

      if(day === 'today') {
        this.orderTiming = 'Today - ' + deliveryTime;
        sessionStorage.setItem('orderTiming', this.orderTiming);
        sessionStorage.setItem('preOrderDay', day);
        sessionStorage.setItem('preOrderTime', time);
      } else if(day === 'tomorrow') {
        this.orderTiming = 'Tomorrow - ' + deliveryTime;
        sessionStorage.setItem('orderTiming', this.orderTiming);
        sessionStorage.setItem('preOrderDay', day);
        sessionStorage.setItem('preOrderTime', time);
      }
    } else {
      this.orderTiming = 'ASAP';
      sessionStorage.setItem('orderTiming', this.orderTiming);
      sessionStorage.setItem('isPreOrder', JSON.stringify(false));
    }
    this.mode = '';
  }

  getOrderTiming() {
    this.isLoadingStore = true;
    let todayWorkingHour: any;
    let tomorrowWorkingHour: any;
    let eta: any;
    let deliveryTime: any;
    const today = new Date();
    const day = today.getDay();
    const hour = today.getHours();
    const minutes = today.getMinutes();
    const todayTime = hour + ':' + minutes;

    this.subscriptions.push(
      this.apollo.watchQuery({
        query: StoreLookupByIdDocument,
        variables: {
          id: this.storeId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result: any) => {
        sessionStorage.setItem('store', JSON.stringify(result.data.store));
        this.store = result.data.store;

        if(this.store.deliveryEnabled && this.store.pickupEnabled) {
          if(!this.orderType) {
            this.orderType = 'delivery';
            sessionStorage.setItem('orderType', 'delivery');
          }
        } else if(this.store.deliveryEnabled && !this.store.pickupEnabled) {
          this.orderType = 'delivery';
          sessionStorage.setItem('orderType', 'delivery');
        } else if(!this.store.deliveryEnabled && this.store.pickupEnabled) {
          this.orderType = 'pickup';
          sessionStorage.setItem('orderType', 'pickup');
        } else {
          this.orderType = '';
          sessionStorage.setItem('orderType', '');
        }

        if(!this.deliveryAddress) {
          this.addressNotification = 'Please select a delivery address';
        }

        if(this.orderType === 'pickup') {
          eta = this.store.pickupEta;
          const address = this.store.address.addressLine1 + ' ' +
            this.store.address.city + ' ' +
            this.store.address.country;
            sessionStorage.setItem('deliveryAddress', address);
          this.deliveryAddress = address;
          switch (day) {
            case 0:
              todayWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'SUNDAY')[0];
              break;
            case 1:
              todayWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'MONDAY')[0];
              break;
            case 2:
              todayWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'TUESDAY')[0];
              break;
            case 3:
              todayWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'WEDNESDAY')[0];
              break;
            case 4:
              todayWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'THURSDAY')[0];
              break;
            case 5:
              todayWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'FRIDAY')[0];
              break;
            case 6:
              todayWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'SATURDAY')[0];
          }
          switch ((day + 1) % 7) {
            case 0:
              tomorrowWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'SUNDAY')[0];
              break;
            case 1:
              tomorrowWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'MONDAY')[0];
              break;
            case 2:
              tomorrowWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'TUESDAY')[0];
              break;
            case 3:
              tomorrowWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'WEDNESDAY')[0];
              break;
            case 4:
              tomorrowWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'THURSDAY')[0];
              break;
            case 5:
              tomorrowWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'FRIDAY')[0];
              break;
            case 6:
              tomorrowWorkingHour = this.store.pickupHours.filter((pickupHour) => pickupHour.dayOfWeek === 'SATURDAY')[0];
          }
        }
        else if(this.orderType === 'delivery') {
          eta = this.store.deliveryEta;
          switch (day) {
            case 0:
              todayWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'SUNDAY')[0];
              break;
            case 1:
              todayWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'MONDAY')[0];
              break;
            case 2:
              todayWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'TUESDAY')[0];
              break;
            case 3:
              todayWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'WEDNESDAY')[0];
              break;
            case 4:
              todayWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'THURSDAY')[0];
              break;
            case 5:
              todayWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'FRIDAY')[0];
              break;
            case 6:
              todayWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'SATURDAY')[0];
          }
          switch ((day + 1) % 7) {
            case 0:
              tomorrowWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'SUNDAY')[0];
              break;
            case 1:
              tomorrowWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'MONDAY')[0];
              break;
            case 2:
              tomorrowWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'TUESDAY')[0];
              break;
            case 3:
              tomorrowWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'WEDNESDAY')[0];
              break;
            case 4:
              tomorrowWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'THURSDAY')[0];
              break;
            case 5:
              tomorrowWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'FRIDAY')[0];
              break;
            case 6:
              tomorrowWorkingHour = this.store.deliveryHours.filter((deliveryHour) => deliveryHour.dayOfWeek === 'SATURDAY')[0];
          }
        }

        this.getAvailableTimesForPreOrder(todayWorkingHour, tomorrowWorkingHour);

        if(!this.isPreOrder) {
          if(todayWorkingHour) {
            if(this.minutesOfDay(todayWorkingHour.timePeriods[0].from) < this.minutesOfDay(todayTime) &&
              this.minutesOfDay(todayWorkingHour.timePeriods[0].to) > this.minutesOfDay(todayTime)) {
              this.orderTiming = 'ASAP';
            } else if(this.minutesOfDay(todayWorkingHour.timePeriods[0].from) > this.minutesOfDay(todayTime)) {
              deliveryTime = this.timeConvert(this.minutesOfDay(todayWorkingHour.timePeriods[0].from) + eta);
              this.orderTiming = 'Today - ' + deliveryTime;
            } else if(this.minutesOfDay(todayWorkingHour.timePeriods[0].to) < this.minutesOfDay(todayTime)) {
              if(tomorrowWorkingHour) {
                deliveryTime = this.timeConvert(this.minutesOfDay(tomorrowWorkingHour.timePeriods[0].from) + eta);
                this.orderTiming = 'Tomorrow - ' + deliveryTime;
              } else {
                this.isClosedStore = true;
                this.orderTiming = '';
              }
            }

            sessionStorage.setItem('orderTiming', this.orderTiming);
          } else if(!todayWorkingHour && tomorrowWorkingHour) {
            deliveryTime = this.timeConvert(this.minutesOfDay(tomorrowWorkingHour.timePeriods[0].from) + eta);
            this.orderTiming = 'Tomorrow - ' + deliveryTime;

            sessionStorage.setItem('orderTiming', this.orderTiming);
          } else if(!todayWorkingHour && !tomorrowWorkingHour){

            this.isClosedStore = true;
            sessionStorage.setItem('orderTiming', '');
          }
        }

        if((this.deliveryAddress === '' || this.deliveryAddress === null) ||
          (this.orderType === 'pickup' && this.store && this.store.pickupEnabled === false) ||
          (this.orderType === 'delivery' && this.store && this.store.deliveryEnabled === false) ||
          (this.isClosedStore && (this.orderType === 'pickup' || this.orderType === 'delivery')) ||
          (!this.store) ||
          (this.store && this.store.deliveryEnabled && !this.minOrderDeliveryZone && this.orderType === 'delivery'))
        {
          this.isEnableOrdering = false;
        }

        this.isLoadingStore = false;
      },
      (err) => {
        this.isLoadingStore = false;
      })
    )
  }

  minutesOfDay(m: string){
    const parseStr = m.split(':');
    // tslint:disable-next-line:radix
    return parseInt(parseStr[0]) * 60 + parseInt(parseStr[1]);
  }

  timeConvert(n: number) {
    const num = n;
    const hours = (num / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);
    const shours = rhours.toString().length === 1 ? '0' + rhours.toString() : rhours.toString();
    const sminutes = rminutes.toString().length === 1 ? '0' + rminutes.toString() : rminutes.toString();
    return shours + ':' + sminutes;
  }

  readMoreDescription(viewCategoryDescriptionModal: TemplateRef<any>, category) {
    this.selectedCategory = category;
    this.modalService.open(viewCategoryDescriptionModal,
      {centered: true, windowClass: 'category-description-modal'}).result.then((result)=>{
    },
    ()=>{});
  }

  formatDescriptionContent(content: string) {
    return `${content.substr(0, this.descriptionWordsLimit)}...`;
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

  onScroll() {
    const items = document.querySelectorAll('.category-name');

    let result = 0;

    if (document.body.scrollHeight - window.scrollY <= window.innerHeight + 30) {
      result = items.length - 1;
    } else {
      items.forEach((item, i) => {
        // @ts-ignore
        if (window.scrollY - item.offsetTop + 70 >= 0) result = i;
      });
    }

    if (this.catInView !== result) {
      const catNav = document.querySelector('.categories-nav');
      const cats = document.querySelectorAll('.categories-nav__link');
      // @ts-ignore
      catNav.scroll({left: cats.item(result).offsetLeft-10, top: 0, behavior: 'smooth'});
      this.catInView = result;
    }

  }

  ngAfterViewInit(): void {
    this.onScrollFn = this.onScroll.bind(this);
    document.addEventListener('scroll', this.onScrollFn);
  }

  ngOnDestroy(): void {
    if (this.onScrollFn) {
      document.removeEventListener('scroll', this.onScrollFn);
    }

    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

  scrollTo($event, i: number) {
    $event.preventDefault();
    const items = document.querySelectorAll('.category-name');
    // @ts-ignore
    window.scroll({left: 0, top: items.item(i).offsetTop-60, behavior: 'smooth'});

  }

  deliveryModal(content) {
    this.modalService.open(content, {backdropClass: 'modal-bottom-backdrop', windowClass: 'modal-bottom'}).result.then((result) => {
    }, (reason) => {
      this.mode = '';
    });
  }

  openDiscountModal(discountModal, discount: any) {
    this.selectedDiscount = discount;
    this.modalService.open(discountModal, {backdropClass: 'modal-bottom-backdrop', windowClass: 'modal-bottom'}).result.then((result) => {
    }, (reason) => {
    });
  }

  openLoyaltyProgramModal(loyaltyProgramModal) {
    this.modalService.open(loyaltyProgramModal, {backdropClass: 'modal-bottom-backdrop', windowClass: 'loyalty-modal'}).result.then((result) => {
    }, (reason) => {
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  goToViewBasket() {
    const cartId = sessionStorage.getItem('cartId');
    this.isAddingDiscountToCart = true;
    const appliedDiscount = JSON.parse(sessionStorage.getItem('appliedDiscount'));
    if(appliedDiscount) {
      this.subscriptions.push(
        this.apollo.mutate({
          mutation: AddDiscountsToCartDocument,
          variables: {
            cart: cartId,
            discounts: [appliedDiscount.discount.node.id]
          }
        }).subscribe((result: any) => {
          this.isAddingDiscountToCart = false;
          appliedDiscount.discount.node.calculatedDiscountValue = result.data.addDiscountsToCart.discountValue;
          this.cart.discount = appliedDiscount;
          sessionStorage.setItem('cart', JSON.stringify(this.cart));
          sessionStorage.setItem('appliedDiscount', JSON.stringify(appliedDiscount));
          if(this.parentPath) {
            this.router.navigate(['/', this.parentPath, this.slug, 'cart'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
          } else {
            this.router.navigate(['/', this.slug, 'cart'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
          }
        },
        (err) => {
          this.isAddingDiscountToCart = false;
        })
      );
    } else {
      this.isAddingDiscountToCart = false;
      if(this.parentPath) {
        this.router.navigate(['/', this.parentPath, this.slug, 'cart'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
      } else {
        this.router.navigate(['/', this.slug, 'cart'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
      }
    }
  }

  openProductDetailModal(productId) {
    this.product = null;
    this.productId = productId;
    this.isLoadingProductDetail = true;
    $(document).ready(function() {
      $("#productDetailLoading").css({display: 'inline-block', top: $(window).scrollTop() + $(window).height() / 2, position: 'absolute', left: '48%'});
    });
    this.productDetail();
  }

  productDetail() {
    this.itemQuantity = 1;
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogProductDocument,
        variables: {
          id: this.productId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result: any) => {
        this.product = result.data.catalogProduct;
        this.modifiersList = this.product.modifierConnection.edges;
        for(const modifier of this.modifiersList) {
          for(const modifierItem of modifier.node.optionConnection.edges) {
            if (modifierItem.node.quantity > 0) {
              modifierItem.node.checked = true;
            } else {
              modifierItem.node.checked = false;
            }
          }
        }
        this.isLoadingProductDetail = false;

        this.modalService.open(this.productDetailModal, {backdropClass: 'modal-bottom-backdrop', windowClass: 'product-detail-modal'}).result.then((result) => {
        }, (reason) => {
        });
      })
    )
  }

  createCartOrAddToCart() {
    this.isInvalidMandatoryModifiers = false;
    let mandatoryModifiers = [];
    this.modifiersList.map((modifier) => {
      if(modifier.node.minQuantity !== 0) {
        modifier.node.isInvalidMandatoryModifiers = false;
      }
    });
    mandatoryModifiers = this.modifiersList.filter((modifier) => modifier.node.minQuantity !== 0);
    for(const modifier of mandatoryModifiers) {
      let checkedMandatoryModifierItems = [];
      if(modifier.node.multiple) {
        let checkedMandatoryMultipleModifierItemsCount = 0;
        checkedMandatoryModifierItems = modifier.node.optionConnection.edges.filter((modifierItem) => {
          return (modifierItem.node.checked === true)
        });

        checkedMandatoryModifierItems.map((item) => {
          checkedMandatoryMultipleModifierItemsCount += item.node.quantity;
        })

        if(checkedMandatoryMultipleModifierItemsCount < modifier.node.minQuantity) {
          modifier.node.isInvalidMandatoryModifiers = true;
        }
      } else {
        checkedMandatoryModifierItems = modifier.node.optionConnection.edges.filter((modifierItem) => {
          return (modifierItem.node.checked === true)
        });

        if(checkedMandatoryModifierItems.length < modifier.node.minQuantity) {
          modifier.node.isInvalidMandatoryModifiers = true;
        }
      }
    }

    for(const modifier of mandatoryModifiers) {
      if(modifier.node.isInvalidMandatoryModifiers === true) {
        this.isInvalidMandatoryModifiers = true;
        this.openSnackBar();
        break;
      }
    }

    if(!this.isEnableOrdering) {
      this.openSnackBar();
    }

    if(!this.orderTiming) {
      this.openSnackBar();
    }

    if(this.orderType === '' || this.orderType === 'null') {
      this.openSnackBar();
    }

    if(this.isInvalidMandatoryModifiers === false && this.isEnableOrdering === true && this.orderTiming && this.orderType !== '' && this.orderType !== 'null') {
      if (this.cart !== undefined && this.cart !== null) {
        this.addToCart();
      } else {
        this.createCart();
      }
    }
  }

  createCart() {
    this.isCreatingCart = true;
    let cartDetail = null;
    let productTotalPrice = 0;
    let modifierItemsTotalPrice = 0;
    this.selectedModifierItems = [];
    const cartProducts = [];

    for(const modifier of this.modifiersList) {
      for(const modifierItem of modifier.node.optionConnection.edges) {
        if (modifierItem.node.checked === true) {
          this.selectedModifierItems.push({
            catalogModifierOption: modifierItem.node.id,
            name: modifierItem.node.name,
            quantity: modifierItem.node.quantity,
            price: modifierItem.node.price
          });

          modifierItemsTotalPrice += (modifierItem.node.price * modifierItem.node.quantity);
        }
      }
    }

    productTotalPrice = (this.product.price + modifierItemsTotalPrice) * this.itemQuantity;

    cartDetail = {
      catalog: this.catalogId,
      products: [
        {
          catalogProduct: this.productId,
          name: this.product.name,
          quantity: this.itemQuantity,
          price: this.product.price,
          modifiers: this.selectedModifierItems,
          productTotalPrice
        }
      ],
      totalPrice: productTotalPrice
    };

    for(const cartProduct of cartDetail.products) {
      const modifierItems = [];
      for(const modifierItem of cartProduct.modifiers) {
        modifierItems.push({
          catalogModifierOption: modifierItem.catalogModifierOption,
          quantity: modifierItem.quantity
        });
      }
      cartProducts.push({
        catalogProduct: cartProduct.catalogProduct,
        quantity: cartProduct.quantity,
        modifiers: modifierItems
      });
    }

    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateCartDocument,
        variables: {
          catalog: cartDetail.catalog,
          products: cartProducts
        }
      }).subscribe((result: any) => {
        this.isCreatingCart = false;
        const cartProductId = result.data.createCart.productConnection.edges[0].node.id;
        cartDetail.products[0].id = cartProductId;
        sessionStorage.setItem('cartId', result.data.createCart.id);
        sessionStorage.setItem('cart', JSON.stringify(cartDetail));
        this.cart = cartDetail;
        this.closeModal();
        if(this.parentPath) {
          this.router.navigate(['/', this.parentPath, this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
        } else {
          this.router.navigate(['/', this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
        }
      },
      (err) => {
        this.isCreatingCart = false;
      })
    );
  }

  addToCart() {
    this.isCreatingCart = true;
    let productTotalPrice = 0;
    this.selectedModifierItems = [];
    let modifierItemsTotalPrice = 0;
    const cartProductModifierItems = [];

    for(const modifier of this.modifiersList) {
      for(const modifierItem of modifier.node.optionConnection.edges) {
        if (modifierItem.node.checked === true) {
          this.selectedModifierItems.push({
            catalogModifierOption: modifierItem.node.id,
            name: modifierItem.node.name,
            quantity: modifierItem.node.quantity,
            price: modifierItem.node.price
          });
          cartProductModifierItems.push({
            catalogModifierOption: modifierItem.node.id,
            quantity: modifierItem.node.quantity
          });
        }
      }
    }

    for(const modifierItem of this.selectedModifierItems) {
      modifierItemsTotalPrice += modifierItem.price * modifierItem.quantity
    }
    productTotalPrice = (this.product.price + modifierItemsTotalPrice) * this.itemQuantity;

    this.cart.totalPrice += productTotalPrice;

    const cartId = sessionStorage.getItem('cartId');

    this.subscriptions.push(
      this.apollo.mutate({
        mutation: AddCartProductDocument,
        variables: {
          cart: cartId,
          catalogProduct: this.productId,
          quantity: this.itemQuantity,
          modifiers: cartProductModifierItems
        }
      }).subscribe((result: any) => {
        this.isCreatingCart = false;
        const cartProductId = result.data.addCartProduct.id;
        this.cart.products.push({
          id: cartProductId,
          catalogProduct: this.productId,
          name: this.product.name,
          quantity: this.itemQuantity,
          price: this.product.price,
          modifiers: this.selectedModifierItems,
          productTotalPrice
        });
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
        this.closeModal();
        if(this.parentPath) {
          this.router.navigate(['/', this.parentPath, this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
        } else {
          this.router.navigate(['/', this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
        }
      },
      (err) => {
        this.isCreatingCart = false;
      })
    );
  }

  increment() {
    this.itemQuantity += 1;
  }

  decrement() {
    if (this.itemQuantity > 1) {
      this.itemQuantity -= 1;
    } else {
      this.itemQuantity = 1;
    }
  }

  incrementModifierItem(modifierItem: any) {
    modifierItem.node.checked = true;
    modifierItem.node.quantity += 1;
  }

  decrementModifierItem(modifierItem: any) {
    if (modifierItem.node.quantity - 1 > 0) {
      modifierItem.node.checked = true;
      modifierItem.node.quantity -= 1;
    } else {
      modifierItem.node.checked = false;
      modifierItem.node.quantity = 0;
    }
  }

  checkModifierItemValue(event: any, modifier: any, modifierItem: any) {
    let checkedMandatoryModifierItems = [];
    checkedMandatoryModifierItems = modifier.node.optionConnection.edges.filter((item) => {
      return (item.node.checked === true)
    });

    if(checkedMandatoryModifierItems.length < modifier.node.maxQuantity) {
      modifierItem.node.quantity = 1;
      modifier.node.optionConnection.edges.map((item) => {
        item.node.isDisabled = false;
      })
    } else if(checkedMandatoryModifierItems.length === modifier.node.maxQuantity) {
      modifierItem.node.quantity = 1;
      modifier.node.optionConnection.edges.map((item) => {
        if(item.node.checked === false) {
          item.node.isDisabled = true;
        }
      })
    } else {
      modifier.node.optionConnection.edges.map((item) => {
        if(item.node.checked === false) {
          item.node.isDisabled = true;
        }
      })
    }
  }

  radioChange($event, modifier) {
    const selectedModifierItem = $event.value;
    modifier.node.optionConnection.edges.map((item) => {
      if(item.node.id === selectedModifierItem.node.id) {
        item.node.checked = true;
        item.node.quantity = 1;
      } else {
        item.node.checked = false;
        item.node.quantity = 0;
      }
    })
  }

  readMoreProductDescription() {
    this.showProductShortDesciption = !this.showProductShortDesciption;
  }

  formatProductDescriptionContent(content: string) {
    if(this.showProductShortDesciption) {
      return `${content.substr(0, this.descriptionWordsLimit)}...`;
    } else {
      return `${content.substr(0, content.length)} `;
    }
  }

  openSnackBar() {
    const currentLang = localStorage.getItem('lang');
    if(currentLang === 'en') {
      if(this.orderType !== '' && this.orderType !== 'null') {
        if(this.isInvalidMandatoryModifiers) {
          this._snackBar.open('Please choose the required modifiers', 'Close', {
            duration: 3000,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            panelClass: ['custom-class']
          });
        } else {
          if(this.deliveryAddress !== null && this.deliveryAddress !== '') {
            if(!this.isEnableOrdering) {
              this._snackBar.open("You can't order for pick or delivery", 'Close', {
                duration: 3000,
                horizontalPosition: this.horizontalPosition,
                verticalPosition: this.verticalPosition,
                panelClass: ['custom-class']
              });
            } else if(!this.orderTiming) {
              if(this.orderType === 'pickup') {
                const snack = this._snackBar.open('The store is not available for pickup', 'Close', {
                  duration: 1000,
                  horizontalPosition: this.horizontalPosition,
                  verticalPosition: this.verticalPosition,
                  panelClass: ['custom-class']
                });
                snack.afterDismissed().subscribe(() => {
                  this.closeModal();
                  if(this.parentPath) {
                    this.router.navigate(['/', this.parentPath, this.slug, 'delivery/pickup'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  } else {
                    this.router.navigate(['/', this.slug, 'delivery/pickup'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  }
                });
              } else if(this.orderType === 'delivery') {
                const snack = this._snackBar.open('Please select another delivery area', 'Close', {
                  duration: 1000,
                  horizontalPosition: this.horizontalPosition,
                  verticalPosition: this.verticalPosition,
                  panelClass: ['custom-class']
                });
                snack.afterDismissed().subscribe(() => {
                  this.closeModal();
                  if(this.parentPath) {
                    this.router.navigate(['/', this.parentPath, this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  } else {
                    this.router.navigate(['/', this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  }
                });
              }
            }
          } else if(this.deliveryAddress === null || this.deliveryAddress === '') {
            this.AddItemToCartFromUrl();
          }
        }
      } else {
        this._snackBar.open('The Store is closed', 'Close', {
          duration: 3000,
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          panelClass: ['custom-class']
        });
      }
    } else if(currentLang === 'it') {
      if(this.orderType !== '' && this.orderType !== 'null') {
        if(this.isInvalidMandatoryModifiers) {
          this._snackBar.open('Selezioni i modificatori', 'Close', {
            duration: 3000,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            panelClass: ['custom-class']
          });
        } else {
          if(this.deliveryAddress !== null && this.deliveryAddress !== '') {
            if(!this.isEnableOrdering) {
              this._snackBar.open("Adesso non è possible accettare ordini", 'Close', {
                duration: 3000,
                horizontalPosition: this.horizontalPosition,
                verticalPosition: this.verticalPosition,
                panelClass: ['custom-class']
              });
            } else if(!this.orderTiming) {
              if(this.orderType === 'pickup') {
                const snack = this._snackBar.open('Punto vendita non disponibile', 'Close', {
                  duration: 1000,
                  horizontalPosition: this.horizontalPosition,
                  verticalPosition: this.verticalPosition,
                  panelClass: ['custom-class']
                });
                snack.afterDismissed().subscribe(() => {
                  this.closeModal();
                  if(this.parentPath) {
                    this.router.navigate(['/', this.parentPath, this.slug, 'delivery/pickup'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  } else {
                    this.router.navigate(['/', this.slug, 'delivery/pickup'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  }
                });
              } else if(this.orderType === 'delivery') {
                const snack = this._snackBar.open('Punto vendita non è disponibile', 'Close', {
                  duration: 1000,
                  horizontalPosition: this.horizontalPosition,
                  verticalPosition: this.verticalPosition,
                  panelClass: ['custom-class']
                });
                snack.afterDismissed().subscribe(() => {
                  this.closeModal();
                  if(this.parentPath) {
                    this.router.navigate(['/', this.parentPath, this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  } else {
                    this.router.navigate(['/', this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                  }
                });
              }
            }
          } else if(this.deliveryAddress === null || this.deliveryAddress === '') {
            this.AddItemToCartFromUrl();
          }
        }
      } else {
        this._snackBar.open('Il negozio è chiuso', 'Close', {
          duration: 3000,
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          panelClass: ['custom-class']
        });
      }
    }
  }

  AddItemToCartFromUrl() {
    let cartDetail = null;
    let productTotalPrice = 0;
    let modifierItemsTotalPrice = 0;
    this.selectedModifierItems = [];
    const cartProducts = [];

    for(const modifier of this.modifiersList) {
      for(const modifierItem of modifier.node.optionConnection.edges) {
        if (modifierItem.node.checked === true) {
          this.selectedModifierItems.push({
            catalogModifierOption: modifierItem.node.id,
            name: modifierItem.node.name,
            quantity: modifierItem.node.quantity,
            price: modifierItem.node.price
          });

          modifierItemsTotalPrice += (modifierItem.node.price * modifierItem.node.quantity);
        }
      }
    }

    productTotalPrice = (this.product.price + modifierItemsTotalPrice) * this.itemQuantity;

    cartDetail = {
      catalog: this.catalogId,
      products: [
        {
          catalogProduct: this.productId,
          name: this.product.name,
          quantity: this.itemQuantity,
          price: this.product.price,
          modifiers: this.selectedModifierItems,
          productTotalPrice
        }
      ],
      totalPrice: productTotalPrice
    };

    for(const cartProduct of cartDetail.products) {
      const modifierItems = [];
      for(const modifierItem of cartProduct.modifiers) {
        modifierItems.push({
          catalogModifierOption: modifierItem.catalogModifierOption,
          quantity: modifierItem.quantity
        });
      }
      cartProducts.push({
        catalogProduct: cartProduct.catalogProduct,
        quantity: cartProduct.quantity,
        modifiers: modifierItems
      });
    }

    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateCartDocument,
        variables: {
          catalog: cartDetail.catalog,
          products: cartProducts
        }
      }).subscribe((result: any) => {
        const cartProductId = result.data.createCart.productConnection.edges[0].node.id;
        cartDetail.products[0].id = cartProductId;
        sessionStorage.setItem('cartId', result.data.createCart.id);
        sessionStorage.setItem('cart', JSON.stringify(cartDetail));
        this.closeModal();
        if(this.parentPath) {
          this.router.navigate(['/', this.parentPath, this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
        } else {
          this.router.navigate(['/', this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
        }
      },
      (err) => {
      })
    );
  }
}
