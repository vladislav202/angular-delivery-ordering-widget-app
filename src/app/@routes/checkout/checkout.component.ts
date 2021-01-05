import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { DeliveryCheckoutOrderWithOnlineNewCardGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { DeliveryCheckoutOrderWithOnlineExistingCardGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { DeliveryCheckoutOrderWithOfflineCashGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { DeliveryCheckoutOrderWithOfflineCardGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { PickupCheckoutOrderWithOnlineNewCardGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { PickupCheckoutOrderWithOnlineExistingCardGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { PickupCheckoutOrderWithOfflineCashGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { PickupCheckoutOrderWithOfflineCardGQL } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { RemoveDiscountsFromCartDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { ApplyDiscountCodeToCartDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidateDiscountsBeforeCheckoutDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { CustomerDocument } from '@app/@core/graphql/operations/customer/query.ops.g';
import { ActiveLoyaltyPointsDocument } from '@app/@core/graphql/operations/loyalty/query.ops.g';
import { MaximumRedemptionLoyaltyPointsDocument } from '@app/@core/graphql/operations/loyalty/query.ops.g';
import { RedeemLoyaltyPointsDocument } from '@app/@core/graphql/operations/loyalty/mutation.ops.g';
import { UpdateCustomerDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { TIMES_DATA } from '@app/@shared/mock-data/time-data';
import {Apollo} from 'apollo-angular';
import { DeleteCardDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';

declare var $: any;

export enum OrderSourceChannel {
  Website = 'WEBSITE',
  Mobile = 'MOBILE',
  Facebook = 'FACEBOOK',
  Instagram = 'INSTAGRAM',
  Messenger = 'MESSENGER',
  Whatsapp = 'WHATSAPP',
  Sms = 'SMS',
  Email = 'EMAIL',
  Google = 'GOOGLE',
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];
  @ViewChild('errorMessageModal') errorMessageModal: TemplateRef<any>;

  createCustomerForm: FormGroup;
  promoCodeForm: FormGroup;
  isPlaceOrderLoading = false;

  orderType: any;
  modeTimeWhen = 'today';
  otpToken = '';
  paymentMethodToken = '';
  paymentMethod = '';
  storeId: any;
  store: any;
  catalogId: any;
  slug = '';
  currency: any;
  cartId: any;
  cart: any = null;
  minOrderDeliveryZone: any;
  deliveryZoneId: any;
  deliveryFee = 0;
  freeDeliveryAmount: any;
  storeComment = '';

  deliveryAddress = '';
  selectedCard: any;
  isErrorPaymentMethod = false;
  isInvalidPromoCode = false;
  isApplyingCode = false;
  detectedChannel: any;
  isCheckingDiscountValidation = false;
  orderTiming: any;
  pixelID: any;
  parentPath: any;

  timesData: any[] = [];
  todayPreOrderTimes: any[] = [];
  tomorrowPreOrderTimes: any[] = [];

  isPreOrder = false;
  isValidCurrentDiscount = true;
  isAppliedFreeDeliveryFee = false;
  loyaltyProgram: any;

  isLoadingCustomerDetail = false;
  activeLoyaltyProgramPoints: any;
  maximumRedemptionLoyaltyPoints: any;
  customerId: any;
  isSetRedemLoyaltyProgram = false;
  catalogWidgetTheme: any;
  currentLang: any;
  coordinates: any;
  appliedDiscount: any;
  errorMessage = '';

  paymentMethods: any = [];
  existingCreditCardInfo: any[] =[];
  isOpenCardForm = false;
  sourceInfluencer: string;
  formActionUrl = '';
  isRemovingCard = false;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private deliveryCheckoutOrderWithOnlineNewCardGQL: DeliveryCheckoutOrderWithOnlineNewCardGQL,
    private deliveryCheckoutOrderWithOnlineExistingCardGQL: DeliveryCheckoutOrderWithOnlineExistingCardGQL,
    private deliveryCheckoutOrderWithOfflineCashGQL: DeliveryCheckoutOrderWithOfflineCashGQL,
    private deliveryCheckoutOrderWithOfflineCardGQL: DeliveryCheckoutOrderWithOfflineCardGQL,
    private pickupCheckoutOrderWithOnlineNewCardGQL: PickupCheckoutOrderWithOnlineNewCardGQL,
    private pickupCheckoutOrderWithOnlineExistingCardGQL: PickupCheckoutOrderWithOnlineExistingCardGQL,
    private pickupCheckoutOrderWithOfflineCashGQL: PickupCheckoutOrderWithOfflineCashGQL,
    private pickupCheckoutOrderWithOfflineCardGQL: PickupCheckoutOrderWithOfflineCardGQL,
    public apollo: Apollo

  ) {

    this.slug = sessionStorage.getItem('slug');
    this.catalogId = sessionStorage.getItem('catalogId');
    this.currency = sessionStorage.getItem('currency');
    this.storeId = sessionStorage.getItem('storeId');
    this.store = JSON.parse(sessionStorage.getItem('store'));
    this.cart = JSON.parse(sessionStorage.getItem('cart'));
    this.cartId = sessionStorage.getItem('cartId');
    this.deliveryAddress = sessionStorage.getItem('deliveryAddress');
    this.otpToken = localStorage.getItem('otp_token');
    this.paymentMethodToken = sessionStorage.getItem('payment_method_token');
    this.paymentMethod = sessionStorage.getItem('paymentMethod');
    this.storeComment = sessionStorage.getItem('storeComment');
    this.orderType = sessionStorage.getItem('orderType');
    this.orderTiming = sessionStorage.getItem('orderTiming');
    this.parentPath = sessionStorage.getItem('parentPath');
    this.isPreOrder = JSON.parse(sessionStorage.getItem('isPreOrder'));
    this.minOrderDeliveryZone = JSON.parse(sessionStorage.getItem('minOrderDeliveryZone'));
    this.loyaltyProgram = JSON.parse(sessionStorage.getItem('loyaltyProgram'));
    this.isSetRedemLoyaltyProgram = JSON.parse(sessionStorage.getItem('isSetRedemLoyaltyProgram'));
    this.appliedDiscount = JSON.parse(sessionStorage.getItem('appliedDiscount'));
    this.currentLang = localStorage.getItem('lang');
    this.catalogWidgetTheme = JSON.parse(sessionStorage.getItem('catalogWidgetTheme'));
    document.documentElement.style.setProperty('--theme-color', this.catalogWidgetTheme.widgetTextColor);
    document.documentElement.style.setProperty('--theme-background-color', this.catalogWidgetTheme.widgetBackgroundColor);

    this.paymentMethods = this.store.paymentMethods;

    if(sessionStorage.getItem('selectedCard') !== null) {
      this.selectedCard = JSON.parse(sessionStorage.getItem('selectedCard'));
    }
    this.detectedChannel = sessionStorage.getItem('channel');

    this.pixelID = sessionStorage.getItem('pixelID');
    this.coordinates = JSON.parse(sessionStorage.getItem('coordinates'));
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
  }

  ngOnInit(): void {
    this.createCustomerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      deliveryAddress: new FormControl('', [Validators.required]),
      deliveryAddress2: new FormControl('', [Validators.required]),
      deliveryComment: new FormControl('')
    });

    this.promoCodeForm = new FormGroup({
      promoCode: new FormControl('', [Validators.required])
    });

    this.timesData = TIMES_DATA;

    this.getAvailableTimesForPreOrder();

    if(this.pixelID) {
      this.trackingPages(this.pixelID);
    }

    if(this.otpToken) {
      this.customerDetail();
    }

    this.getDeliveryFee();
    this.checkFreeDeliveryFee();

    this.createCustomerForm.controls.deliveryAddress.setValue(this.deliveryAddress);
    if(sessionStorage.getItem('deliveryComment') !== null && sessionStorage.getItem('deliveryComment') !== undefined) {
      this.createCustomerForm.controls.deliveryComment.setValue(sessionStorage.getItem('deliveryComment'));
    }

    if(this.parentPath) {
      if(this.sourceInfluencer) {
        this.formActionUrl = '/'+this.parentPath+this.slug+'/checkout?utm_source='+this.sourceInfluencer;
      } else {
        this.formActionUrl = '/'+this.parentPath+this.slug+'/checkout';
      }
    } else {
      if(this.sourceInfluencer) {
        this.formActionUrl = '/'+this.slug+'/checkout?utm_source='+this.sourceInfluencer;
      } else {
        this.formActionUrl = '/'+this.slug+'/checkout';
      }
    }

  }

  changeASAP(content) {
    this.modalService.open(content, {backdropClass: 'modal-bottom-backdrop', windowClass: 'modal-bottom'}).result.then((result) => {
    }, (reason) => {
    });
  }

  getDeliveryFee() {
    if(this.minOrderDeliveryZone) {
      this.deliveryFee = this.minOrderDeliveryZone.fee;
      this.deliveryZoneId = this.minOrderDeliveryZone.id;
      this.freeDeliveryAmount = this.minOrderDeliveryZone.freeDeliveryAmount;
    }
  }

  checkFreeDeliveryFee() {
    if(this.freeDeliveryAmount && this.freeDeliveryAmount <= this.cart.totalPrice) {
      this.isAppliedFreeDeliveryFee = true;
    } else {
      this.isAppliedFreeDeliveryFee = false;
    }
  }

  removeDiscount() {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: RemoveDiscountsFromCartDocument,
        variables: {
          cart: this.cartId,
          discounts: [this.cart.discount.discount.node.id]
        }
      }).subscribe((result: any) => {
        this.cart.discount = null;
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
        this.isCheckingDiscountValidation = false;
      })
    );
  }

  openPromoCodeModal(content) {
    this.modalService.open(content, {centered: true}).result.then((result) => {
    }, (reason) => {
    });
  }

  applyPromoCode() {
    this.isApplyingCode = true;
    const promoCode = this.promoCodeForm.value.promoCode;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: ApplyDiscountCodeToCartDocument,
        variables: {
          cart: this.cartId,
          code: promoCode
        }
      }).subscribe((result: any) => {
        const discount = result.data.applyDiscountCodeToCart.discountConnection.edges[0];
        if(this.customerId) {
          this.subscriptions.push(
            this.apollo.mutate({
              mutation: ValidateDiscountsBeforeCheckoutDocument,
              variables: {
                cart: this.cartId,
                customer: this.customerId
              }
            }).subscribe((result: any) => {
              const validatedDiscountValue = result.data.validateDiscountsBeforeCheckout.discountValue;
              if(validatedDiscountValue === 0) {
                this.removeDiscount();
                this.isValidCurrentDiscount = false;
                this.isApplyingCode = false;
                this.closeModal();
              } else {
                this.isValidCurrentDiscount = true;
                this.isApplyingCode = false;
                discount.node.applied = true;
                discount.node.calculatedDiscountValue = validatedDiscountValue;
                const appliedDiscount = {
                  catalogId: this.catalogId,
                  discount
                };
                this.cart.discount = appliedDiscount;
                sessionStorage.setItem('cart', JSON.stringify(this.cart));
                this.closeModal();
              }
            })
          );
        }
      },
      (err) => {
        this.isApplyingCode = false;
        this.isInvalidPromoCode = true;
      })
    );
  }

  closeModal() {
    this.isInvalidPromoCode = false;
    this.promoCodeForm.reset();
    this.modalService.dismissAll();
  }

  customerDetail() {
    this.isCheckingDiscountValidation = true;
    this.apollo.watchQuery({
      query: CustomerDocument,
      variables: {phoneAccessToken: this.otpToken},
      fetchPolicy: 'no-cache',
    }).valueChanges.subscribe((result: any) => {
      const customer = result.data.customer;
      this.existingCreditCardInfo = customer.cards;
      localStorage.setItem('customerId', customer.id);
      this.customerId = customer.id;
      if(customer.lastOrder && customer.lastOrder.customerName) {
        if(sessionStorage.getItem('customerName') && sessionStorage.getItem('customerName') !== 'null') {
          this.createCustomerForm.controls.name.setValue(sessionStorage.getItem('customerName'));
        } else {
          this.createCustomerForm.controls.name.setValue(customer.lastOrder.customerName);
          sessionStorage.setItem('customerName', customer.lastOrder.customerName);
        }
      }
      if(!customer.lastOrder && sessionStorage.getItem('customerName') && sessionStorage.getItem('customerName') !== 'null') {
        this.createCustomerForm.controls.name.setValue(sessionStorage.getItem('customerName'));
      }
      if(customer.lastOrder && customer.lastOrder.delivery.address) {
        if(sessionStorage.getItem('deliveryAddress2') && sessionStorage.getItem('deliveryAddress2') !== 'null') {
          this.createCustomerForm.controls.deliveryAddress2.setValue(sessionStorage.getItem('deliveryAddress2'));
        } else {
          this.createCustomerForm.controls.deliveryAddress2.setValue(customer.lastOrder.delivery.address.addressLine2);
          sessionStorage.setItem('deliveryAddress2', customer.lastOrder.delivery.address.addressLine2);
        }
      }
      if(customer.lastOrder && !customer.lastOrder.delivery.address) {
        if(sessionStorage.getItem('deliveryAddress2') && sessionStorage.getItem('deliveryAddress2') !== 'null') {
          this.createCustomerForm.controls.deliveryAddress2.setValue(sessionStorage.getItem('deliveryAddress2'));
        }
      }
      if(!customer.lastOrder && sessionStorage.getItem('deliveryAddress2') && sessionStorage.getItem('deliveryAddress2') !== 'null'){
        this.createCustomerForm.controls.deliveryAddress2.setValue(sessionStorage.getItem('deliveryAddress2'));
      }
      if(this.loyaltyProgram) {
        this.getActiveLoyaltyPoints(customer.id);
      }
      this.getMaximumRedemptionLoyaltyPoints(customer.id);

      if(this.cart.discount && (this.cart.totalPrice >= this.cart.discount.discount.node.minOrderAmount)) {
        this.validateDiscounts(customer.id);
      } else if(this.cart.discount && (this.cart.totalPrice < this.cart.discount.discount.node.minOrderAmount)){
        this.removeDiscount();
      } else {
        this.isCheckingDiscountValidation = false;
      }
    },
    (err) => {
      this.isCheckingDiscountValidation = false;
      if(sessionStorage.getItem('customerName') && sessionStorage.getItem('customerName') !== 'null') {
        this.createCustomerForm.controls.name.setValue(sessionStorage.getItem('customerName'));
      }
      if(sessionStorage.getItem('deliveryAddress2') && sessionStorage.getItem('deliveryAddress2') !== 'null') {
        this.createCustomerForm.controls.deliveryAddress2.setValue(sessionStorage.getItem('deliveryAddress2'));
      }
    })
  }

  updateCustomer() {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateCustomerDocument,
        variables: {
          id: this.customerId,
          locale: this.currentLang
        }
      }).subscribe((result: any) => {
      })
    );
  }

  placeOrder() {
    if(this.createCustomerForm.controls.name.invalid) {
      if(this.currentLang === 'en') {
        this.errorMessage = 'Please enter the name.';
      } else if(this.currentLang === 'it') {
        this.errorMessage = 'Inserisci il nome.';
      }
      this.openErrorMessageModal();
    } else if(this.orderType === 'delivery' && this.createCustomerForm.controls.deliveryAddress2.invalid) {
      if(this.currentLang === 'en') {
        this.errorMessage = 'Please enter the building name.';
      } else if(this.currentLang === 'it') {
        this.errorMessage = "Inserisci il nome dell'edificio.";
      }
      this.openErrorMessageModal();
    } else if(!this.paymentMethod) {
      if(this.currentLang === 'en') {
        this.errorMessage = 'Please select the payment method.';
      } else if(this.currentLang === 'it') {
        this.errorMessage = "Seleziona il metodo di pagamento.";
      }
      this.openErrorMessageModal();
    } else if(this.orderType === 'delivery' && !this.coordinates) {
      this.errorMessage = 'Please confirm the delivery location.';
      this.openErrorMessageModal();
    } else {
      this.isPlaceOrderLoading = true;
      if(this.customerId && this.isSetRedemLoyaltyProgram) {
        if(this.cart.discount) {
          this.subscriptions.push(
            this.apollo.mutate({
              mutation: RemoveDiscountsFromCartDocument,
              variables: {
                cart: this.cartId,
                discounts: [this.cart.discount.discount.node.id]
              }
            }).subscribe((result: any) => {
              this.cart.discount = null;
              sessionStorage.setItem('cart', JSON.stringify(this.cart));
              this.redeemLoyaltyPoints();
            })
          );
        } else {
          this.redeemLoyaltyPoints();
        }
      } else {
        this.checkoutOrder();
      }
      this.updateCustomer();
    }
  }

  checkoutOrder() {
    let channelSource: any;
    this.isErrorPaymentMethod = false;
    const formValue = this.createCustomerForm.value;
    sessionStorage.setItem('customerName', formValue.name);
    sessionStorage.setItem('deliveryAddress2', formValue.deliveryAddress2);
    sessionStorage.setItem('deliveryAddress', formValue.deliveryAddress);

    if(this.detectedChannel && this.detectedChannel === 'facebook') {
      channelSource = OrderSourceChannel.Facebook;
    } else if(this.detectedChannel && this.detectedChannel === 'instagram') {
      channelSource = OrderSourceChannel.Instagram;
    } else if(this.detectedChannel && this.detectedChannel === 'messenger') {
      channelSource = OrderSourceChannel.Messenger;
    } else if(this.detectedChannel && this.detectedChannel === 'whatsapp') {
      channelSource = OrderSourceChannel.Whatsapp;
    } else if(this.detectedChannel && this.detectedChannel === 'sms') {
      channelSource = OrderSourceChannel.Sms;
    } else if(this.detectedChannel && this.detectedChannel === 'email') {
      channelSource = OrderSourceChannel.Email;
    } else if(this.detectedChannel && this.detectedChannel === 'google') {
      channelSource = OrderSourceChannel.Google;
    } else {
      channelSource = OrderSourceChannel.Website;
    }

    if(this.isPreOrder) {
      const preOrderDay = sessionStorage.getItem('preOrderDay');
      const preOrderTime = sessionStorage.getItem('preOrderTime');
      const parseStr = preOrderTime.split(':');
      let preOrderDate: any;
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const date = today.getDate();
      // tslint:disable-next-line: radix
      const hour = parseInt(parseStr[0]);
      // tslint:disable-next-line:radix
      const minutes = parseInt(parseStr[1]);

      if(preOrderDay === 'today') {
        preOrderDate = new Date(year, month, date, hour, minutes, 0);
      } else if(preOrderDay === 'tomorrow') {
        preOrderDate = new Date(year, month, date + 1, hour, minutes, 0);
      }

      if(this.orderType === 'delivery') {
        if(sessionStorage.getItem('onlineCardType') === 'new') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOnlineNewCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                cardId: this.paymentMethodToken,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Cash on delivery') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOfflineCashGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Card on delivery') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOfflineCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(sessionStorage.getItem('onlineCardType') === 'existing') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOnlineExistingCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                firstSixDigits: this.selectedCard.firstSixDigits,
                lastFourDigits: this.selectedCard.lastFourDigits,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        }
      } else if(this.orderType === 'pickup') {
        if(sessionStorage.getItem('onlineCardType') === 'new') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOnlineNewCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                cardId: this.paymentMethodToken,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Cash on pickup') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOfflineCashGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Card on pickup') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOfflineCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(sessionStorage.getItem('onlineCardType') === 'existing') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOnlineExistingCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                firstSixDigits: this.selectedCard.firstSixDigits,
                lastFourDigits: this.selectedCard.lastFourDigits,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
                preOrderBy: preOrderDate.toISOString()
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                sessionStorage.setItem('isPreOrder', JSON.stringify(false));
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        }
      }
    } else if(!this.isPreOrder) {
      if(this.orderType === 'delivery') {
        if(sessionStorage.getItem('onlineCardType') === 'new') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOnlineNewCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                cardId: this.paymentMethodToken,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Cash on delivery') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOfflineCashGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Card on delivery') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOfflineCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(sessionStorage.getItem('onlineCardType') === 'existing') {
          this.subscriptions.push(
            this.deliveryCheckoutOrderWithOnlineExistingCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                city: '',
                addressLine1: formValue.deliveryAddress,
                addressLine2: formValue.deliveryAddress2,
                latitude: this.coordinates.latitude,
                longitude: this.coordinates.longitude,
                deliveryZone: this.deliveryZoneId,
                storeComment: this.storeComment,
                deliveryComment: formValue.deliveryComment,
                firstSixDigits: this.selectedCard.firstSixDigits,
                lastFourDigits: this.selectedCard.lastFourDigits,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        }
      } else if(this.orderType === 'pickup') {
        if(sessionStorage.getItem('onlineCardType') === 'new') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOnlineNewCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                cardId: this.paymentMethodToken,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Cash on pickup') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOfflineCashGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(this.paymentMethod === 'Card on pickup') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOfflineCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        } else if(sessionStorage.getItem('onlineCardType') === 'existing') {
          this.subscriptions.push(
            this.pickupCheckoutOrderWithOnlineExistingCardGQL
              .mutate({
                customerToken: this.otpToken,
                customerName: formValue.name,
                cart: this.cartId,
                firstSixDigits: this.selectedCard.firstSixDigits,
                lastFourDigits: this.selectedCard.lastFourDigits,
                store: this.storeId,
                storeComment: this.storeComment,
                source: channelSource,
                sourceInfluencer: this.sourceInfluencer,
              })
              .subscribe((result) => {
                this.isPlaceOrderLoading = false;
                sessionStorage.setItem('cart', '');
                sessionStorage.setItem('cartId', '');
                sessionStorage.setItem('payment_method_token', '');
                sessionStorage.setItem('storeComment', '');
                sessionStorage.setItem('deliveryComment', '');
                if(this.parentPath) {
                  this.router.navigate(['/', this.parentPath, this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                } else {
                  this.router.navigate(['/', this.slug, 'order-confirm', result.data.checkoutOrder.uniqueLink], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
                }
              },
              (err) => {
                this.isErrorPaymentMethod = true;
                this.isPlaceOrderLoading = false;
              })
          )
        }
      }
    }
  }

  openPaymentMethodsModal(content) {
    this.modalService.open(content, {backdropClass: 'modal-bottom-backdrop', windowClass: 'payment-modal'}).result.then((result) => {
    }, (reason) => {
    });
  }

  checkAvailablePaymentMethods(paymentType: any) {
    const type = paymentType;
    let index: any;
    switch (type) {
      case 'deliveryOnlineCard':
        index = this.paymentMethods.indexOf('DELIVERY_ONLINE_CARD');
        if(index > -1) {
          return true;
        } else if(index === -1) {
          return false;
        }
        break;
      case 'deliveryPaymentCash':
        index = this.paymentMethods.indexOf('DELIVERY_CASH');
        if(index > -1) {
          return true;
        } else if(index === -1) {
          return false;
        }
        break;
      case 'deliveryPaymentCard':
        index = this.paymentMethods.indexOf('DELIVERY_CARD');
        if(index > -1) {
          return true;
        } else if(index === -1) {
          return false;
        }
        break;
      case 'pickupOnlineCard':
        index = this.paymentMethods.indexOf('PICKUP_ONLINE_CARD');
        if(index > -1) {
          return true;
        } else if(index === -1) {
          return false;
        }
        break;
      case 'pickupPaymentCash':
        index = this.paymentMethods.indexOf('PICKUP_CASH');
        if(index > -1) {
          return true;
        } else if(index === -1) {
          return false;
        }
        break;
      case 'pickupPaymentCard':
        index = this.paymentMethods.indexOf('PICKUP_CARD');
        if(index > -1) {
          return true;
        } else if(index === -1) {
          return false;
        }
    }
  }

  selectCard(card: any) {
    const cardNumber = '** **** ' + card.lastFourDigits;
    this.paymentMethod = cardNumber;
    this.selectedCard = card;
    sessionStorage.setItem('paymentMethod', cardNumber);
    sessionStorage.setItem('onlineCardType', 'existing');
    sessionStorage.setItem('selectedCard', JSON.stringify(card));
    this.modalService.dismissAll();
  }

  removeCreditCard(card: any, index: any) {
    $(document).ready(function() {
      $("#removeCardLoader").css({display: 'inline-block', top: $(window).scrollTop() + $(window).height() / 2, position: 'absolute', left: '48%'});
    });
    this.isRemovingCard = true;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: DeleteCardDocument,
        variables: {
          customerId: this.customerId,
          firstSixDigits: card.firstSixDigits,
          lastFourDigits: card.lastFourDigits
        }
      }).subscribe(() => {
        this.isRemovingCard = false;
        this.existingCreditCardInfo.splice(index, 1);
        sessionStorage.setItem('existingCards', JSON.stringify(this.existingCreditCardInfo));
      })
    );
  }

  selectPaymentMethod(type) {
    if(type === 'Online') {
      this.isOpenCardForm = !this.isOpenCardForm;
      if(this.isOpenCardForm) {
        $.getScript('./assets/js/customer.js');
      }
    } else if(type === 'Offline Cash') {
      sessionStorage.setItem('onlineCardType', '');
      if(this.orderType === 'delivery') {
        this.paymentMethod = 'Cash on delivery';
        sessionStorage.setItem('paymentMethod', 'Cash on delivery');
      } else if(this.orderType === 'pickup') {
        this.paymentMethod = 'Cash on pickup';
        sessionStorage.setItem('paymentMethod', 'Cash on pickup');
      }
      this.modalService.dismissAll();
    } else if(type === 'Offline Card') {
      sessionStorage.setItem('onlineCardType', '');
      if(this.orderType === 'delivery') {
        this.paymentMethod = 'Card on delivery';
        sessionStorage.setItem('paymentMethod', 'Card on delivery');
      } else if(this.orderType === 'pickup') {
        this.paymentMethod = 'Card on pickup';
        sessionStorage.setItem('paymentMethod', 'Card on pickup');
      }
      this.modalService.dismissAll();
    }
  }

  changeDeliveryAddress() {
    sessionStorage.setItem('customerName', this.createCustomerForm.get('name').value);
    sessionStorage.setItem('deliveryAddress', this.createCustomerForm.get('deliveryAddress').value);
    sessionStorage.setItem('deliveryAddress2', this.createCustomerForm.get('deliveryAddress2').value);
    sessionStorage.setItem('deliveryComment', this.createCustomerForm.get('deliveryComment').value);
    if(this.parentPath) {
      this.router.navigate(['/', this.parentPath, this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate(['/', this.slug, 'delivery'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    }
  }

  changePickupAddress() {
    sessionStorage.setItem('customerName', this.createCustomerForm.get('name').value);
    sessionStorage.setItem('deliveryAddress', this.createCustomerForm.get('deliveryAddress').value);
    if(this.parentPath) {
      this.router.navigate(['/', this.parentPath, this.slug, 'delivery', 'pickup'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate(['/', this.slug, 'delivery', 'pickup'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
    }
  }

  validateDiscounts(customerId: any) {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: ValidateDiscountsBeforeCheckoutDocument,
        variables: {
          cart: this.cartId,
          customer: customerId
        }
      }).subscribe((result: any) => {
        const validatedDiscountValue = result.data.validateDiscountsBeforeCheckout.discountValue;
        if(validatedDiscountValue === 0) {
          this.isValidCurrentDiscount = false;
          this.removeDiscount();
        } else {
          this.isValidCurrentDiscount = true;
          this.cart.discount.discount.node.calculatedDiscountValue = validatedDiscountValue;
          sessionStorage.setItem('cart', JSON.stringify(this.cart));
        }
        this.isCheckingDiscountValidation = false;
      })
    );
  }

  getActiveLoyaltyPoints(customerId) {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: ActiveLoyaltyPointsDocument,
        variables: {
          loyaltyProgram: this.loyaltyProgram.id,
          customer: customerId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result: any) => {
        this.activeLoyaltyProgramPoints = result.data.activeLoyaltyPoints;
      })
    )
  }

  getMaximumRedemptionLoyaltyPoints(customerId) {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: MaximumRedemptionLoyaltyPointsDocument,
        variables: {
          cart: this.cartId,
          customer: customerId
        },
      }).valueChanges.subscribe((result: any) => {
        this.maximumRedemptionLoyaltyPoints = result.data.maximumRedemptionLoyaltyPoints;
        if(!this.maximumRedemptionLoyaltyPoints) {
          this.isSetRedemLoyaltyProgram = false;
          sessionStorage.setItem('isSetRedemLoyaltyProgram', JSON.stringify(false));
        }
      },
      (err) => {
        this.isSetRedemLoyaltyProgram = false;
        sessionStorage.setItem('isSetRedemLoyaltyProgram', JSON.stringify(false));
      })
    )
  }

  redeemLoyaltyPoints() {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: RedeemLoyaltyPointsDocument,
        variables: {
          cart: this.cartId,
          customer: this.customerId,
          points: this.maximumRedemptionLoyaltyPoints
        }
      }).subscribe((result: any) => {
        this.checkoutOrder();
      })
    );
  }

  setRedemLoyaltyProgram(status: boolean) {
    this.isSetRedemLoyaltyProgram = status;
    sessionStorage.setItem('isSetRedemLoyaltyProgram', JSON.stringify(this.isSetRedemLoyaltyProgram));
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

  getAvailableTimesForPreOrder () {
    let todayWorkingHour: any;
    let tomorrowWorkingHour: any;
    const today = new Date();
    const day = today.getDay();
    const hour = today.getHours();
    const minutes = today.getMinutes();
    const todayTime = hour + ':' + minutes;

    if(this.store) {
      if(this.orderType === 'pickup') {
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
  }

  selectPreOrderTime(time: any, day: any) {
    if(time !== 'asap') {
      const deliveryTime = this.timeConvert(this.minutesOfDay(time));
      this.isPreOrder = true;
      sessionStorage.setItem('isPreOrder', JSON.stringify(true));

      if(day === 'today') {
        this.orderTiming = 'Today - ' + deliveryTime;
        sessionStorage.setItem('orderTiming', this.orderTiming);
        sessionStorage.setItem('preOrderDay', day);
        sessionStorage.setItem('preOrderTime', time);
        this.modalService.dismissAll();
      } else if(day === 'tomorrow') {
        this.orderTiming = 'Tomorrow - ' + deliveryTime;
        sessionStorage.setItem('orderTiming', this.orderTiming);
        sessionStorage.setItem('preOrderDay', day);
        sessionStorage.setItem('preOrderTime', time);
        this.modalService.dismissAll();
      }
    } else {
      this.orderTiming = 'ASAP';
      sessionStorage.setItem('orderTiming', this.orderTiming);
      this.isPreOrder = false;
      sessionStorage.setItem('isPreOrder', JSON.stringify(false));
      this.modalService.dismissAll();
    }

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

  openLoyaltyProgramModal(loyaltyProgramModal) {
    this.modalService.open(loyaltyProgramModal, {backdropClass: 'modal-bottom-backdrop', windowClass: 'loyalty-modal'}).result.then((result) => {
    }, (reason) => {
    });
  }

  openErrorMessageModal() {
    this.modalService.open(this.errorMessageModal,
      {centered: true, windowClass: 'error-message-modal'}).result.then((result)=>{
    },
    ()=>{});
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
