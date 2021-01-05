import { Component, OnInit, OnDestroy } from '@angular/core';
import {Apollo} from 'apollo-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ActiveLoyaltyPointsDocument } from '@app/@core/graphql/operations/loyalty/query.ops.g';
import { CatalogProductsWithAvailabilityDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { ValidateDiscountsBeforeCheckoutDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { UpdateCartProductDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { DropCartProductDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { AddDiscountsToCartDocument } from '@app/@core/graphql/operations/customer/mutation.ops.g';

declare var $: any;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  storeId: any;
  parentPath: any;
  catalogId: any;
  cartId: any;
  cart: any = null;
  freeDeliveryAmount: any;
  deliveryFee = 0;
  currency: any;
  otpToken: any;
  slug = '';
  orderType: any;

  orderCommentForm: FormGroup;
  minOrderDeliveryZone: any;
  isShowErrorMessage = false;
  basketIsSmallerThanMinOrder = false;
  unavailableCatalogProductIds = [];
  isIncludingUnavailableProduct = false;
  pixelID: any;
  isAppliedFreeDeliveryFee = false;
  loyaltyProgram: any;
  activeLoyaltyProgramPoints: any;
  customerId: any;
  catalogWidgetTheme: any;
  isCheckingAvailabilityProducts = false;
  isValidCurrentDiscount = true;
  isCheckingDiscountValidation = false;
  sourceInfluencer: string;
  appliedDiscount: any;

  constructor(
    public apollo: Apollo,
    private router: Router,
    private modalService: NgbModal,
  ) {
    this.storeId = sessionStorage.getItem('storeId');
    this.cartId = sessionStorage.getItem('cartId');
    if(sessionStorage.getItem('cart')) {
      this.cart = JSON.parse(sessionStorage.getItem('cart'));
    }

    this.currency = sessionStorage.getItem('currency');
    this.catalogId = sessionStorage.getItem('catalogId');
    this.otpToken = localStorage.getItem('otp_token');
    this.slug = sessionStorage.getItem('slug');
    this.orderType = sessionStorage.getItem('orderType');
    this.minOrderDeliveryZone = JSON.parse(sessionStorage.getItem('minOrderDeliveryZone'));
    this.unavailableCatalogProductIds = JSON.parse(sessionStorage.getItem('unavailableCatalogProductIds'));
    this.pixelID = sessionStorage.getItem('pixelID');
    this.parentPath = sessionStorage.getItem('parentPath');
    this.appliedDiscount =JSON.parse(sessionStorage.getItem('appliedDiscount'));
    this.loyaltyProgram = JSON.parse(sessionStorage.getItem('loyaltyProgram'));
    this.customerId = localStorage.getItem('customerId');
    this.catalogWidgetTheme = JSON.parse(sessionStorage.getItem('catalogWidgetTheme'));
    document.documentElement.style.setProperty('--theme-color', this.catalogWidgetTheme.widgetTextColor);
    document.documentElement.style.setProperty('--theme-background-color', this.catalogWidgetTheme.widgetBackgroundColor);
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
  }

  ngOnInit(): void {
    this.orderCommentForm = new FormGroup({
      storeComment: new FormControl('')
    });

    this.checkAvailabilityProducts();
    if(this.cart.discount) {
      this.checkValidationOfDiscount();
    } else {
      if(this.appliedDiscount) {
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: AddDiscountsToCartDocument,
            variables: {
              cart: this.cartId,
              discounts: [this.appliedDiscount.discount.node.id]
            }
          }).subscribe((result: any) => {
            this.cart.discount = this.appliedDiscount;
            this.cart.discount.discount.node.calculatedDiscountValue = result.data.addDiscountsToCart.discountValue;
            sessionStorage.setItem('cart', JSON.stringify(this.cart));
            this.checkValidationOfDiscount();
          })
        )
      }
    }

    if(this.pixelID) {
      this.trackingPages(this.pixelID);
    }

    if(this.customerId && this.loyaltyProgram) {
      this.getActiveLoyaltyPoints();
    }

    if(sessionStorage.getItem('storeComment') !== null && sessionStorage.getItem('storeComment') !== undefined) {
      this.orderCommentForm.controls.storeComment.setValue(sessionStorage.getItem('storeComment'));
    }

    this.getDeliveryFee();
    this.checkFreeDeliveryFee();
  }

  getDeliveryFee() {
    if(this.minOrderDeliveryZone) {
      this.deliveryFee = this.minOrderDeliveryZone.fee;
      this.freeDeliveryAmount = this.minOrderDeliveryZone.freeDeliveryAmount;
    }
  }

  checkFreeDeliveryFee() {
    if(this.freeDeliveryAmount && this.freeDeliveryAmount <= this.cart.totalPrice) {
      this.isAppliedFreeDeliveryFee = true;
      this.isShowErrorMessage = false;
    } else {
      this.isAppliedFreeDeliveryFee = false;
      if(this.minOrderDeliveryZone && (this.cart.totalPrice < this.minOrderDeliveryZone.minimalAmount)) {
        this.isShowErrorMessage = true;
      } else {
        this.isShowErrorMessage = false;
      }
    }
  }

  checkAvailabilityProducts() {
    this.isCheckingAvailabilityProducts = true;
    const unavailableCatalogProductIds = [];
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogProductsWithAvailabilityDocument,
        variables: {
          slug: this.slug,
          store: this.storeId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result:any) => {

        const categoryList = result.data.catalog.categoryConnection.edges;

        categoryList.map((category) => {
          category.node.productConnection.edges.map((product) => {
            if(!product.node.availability[0].value) {
              unavailableCatalogProductIds.push(product.node.id);
            }
          })
        });

        if(this.cart && this.cart.products.length > 0) {
          this.cart.products.map((product) => {
            if(unavailableCatalogProductIds.includes(product.catalogProduct)) {
              product.availability = false;
              this.isIncludingUnavailableProduct = true;
            } else {
              product.availability = true;
            }
          });

          sessionStorage.setItem('cart', JSON.stringify(this.cart));
        }

        this.isCheckingAvailabilityProducts = false;
      })
    )
  }

  gotoCheckout() {
    const storeComment = this.orderCommentForm.get('storeComment').value;
    sessionStorage.setItem('storeComment', storeComment);
    if(this.otpToken) {
      if(this.parentPath) {
        this.router.navigate(['/', this.parentPath, this.slug, 'checkout'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
      } else {
        this.router.navigate(['/', this.slug, 'checkout'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
      }
    } else {
      if(this.parentPath) {
        this.router.navigate(['/', this.parentPath, this.slug, 'otp'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
      } else {
        this.router.navigate(['/', this.slug, 'otp'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
      }
    }
  }

  removeCartProduct(index: any) {
    const product = this.cart.products[index];
    const modifiers = product.modifiers;
    let modifierItemsTotalPrice = 0;
    for(const modifierItem of modifiers) {
      modifierItemsTotalPrice += modifierItem.price * modifierItem.quantity;
    }
    this.cart.products.splice(index, 1);
    if(this.cart.products.filter((product) => product.availability === false).length !== 0) {
      this.isIncludingUnavailableProduct = true;
    } else {
      this.isIncludingUnavailableProduct = false;
    }
    this.cart.totalPrice = this.cart.totalPrice - (product.price * product.quantity) - modifierItemsTotalPrice;
    this.checkFreeDeliveryFee();
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: DropCartProductDocument,
        variables: {
          id: product.id
        }
      }).subscribe((result: any) => {
        if(this.cart.discount) {
          this.checkValidationOfDiscount();
        } else {
          this.isCheckingDiscountValidation = false;
        }
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
      },
      (err) => {
      })
    );
  }

  increment(index) {
    this.isCheckingDiscountValidation = true;
    $(document).ready(function() {
      $("#checkingDiscountValidation").css({top: $(window).scrollTop() + $(window).height() / 2});
    });
    const product = this.cart.products[index];
    let modifierItemsTotalPrice = 0;
    product.quantity += 1;
    this.cart.products[index].quantity = product.quantity;
    for(const modifier of product.modifiers) {
      modifierItemsTotalPrice += (modifier.price * modifier.quantity);
    }
    product.productTotalPrice += product.price + modifierItemsTotalPrice;
    this.cart.totalPrice = this.cart.totalPrice + product.price + modifierItemsTotalPrice;
    this.checkFreeDeliveryFee();

    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateCartProductDocument,
        variables: {
          id: product.id,
          quantity: product.quantity
        }
      }).subscribe((result: any) => {
        if(this.cart.discount) {
          this.checkValidationOfDiscount();
        } else {
          this.isCheckingDiscountValidation = false;
        }
      },
      (err) => {
      })
    );
    sessionStorage.setItem('cart', JSON.stringify(this.cart));
  }

  decrement(index) {
    this.isCheckingDiscountValidation = true;
    $(document).ready(function() {
      $("#checkingDiscountValidation").css({top: $(window).scrollTop() + $(window).height() / 2});
    });
    const product = this.cart.products[index];
    let modifierItemsTotalPrice = 0;
    if(product.quantity > 1) {
      product.quantity -= 1;
      this.cart.products[index].quantity = product.quantity;
      for(const modifier of product.modifiers) {
        modifierItemsTotalPrice += (modifier.price * modifier.quantity);
      }
      product.productTotalPrice -= (product.price + modifierItemsTotalPrice);
      this.cart.totalPrice = this.cart.totalPrice - product.price - modifierItemsTotalPrice;
      this.checkFreeDeliveryFee();
      this.subscriptions.push(
        this.apollo.mutate({
          mutation: UpdateCartProductDocument,
          variables: {
            id: product.id,
            quantity: product.quantity
          }
        }).subscribe((result: any) => {
          if(this.cart.discount) {
            this.checkValidationOfDiscount();
          } else {
            this.isCheckingDiscountValidation = false;
          }
        },
        (err) => {
        })
      );
      sessionStorage.setItem('cart', JSON.stringify(this.cart));
    } else {
      this.removeCartProduct(index);
    }
  }

  checkValidationOfDiscount() {
    const cartTotalPrice = this.cart.totalPrice;
    const cartDiscount = this.cart.discount;

    if(cartDiscount && cartTotalPrice >= cartDiscount.discount.node.minOrderAmount) {
      this.basketIsSmallerThanMinOrder = false;
    } else {
      this.basketIsSmallerThanMinOrder = true;
    }

    if(!this.basketIsSmallerThanMinOrder) {
      if(this.customerId) {
        this.validateDiscounts(this.customerId);
      } else {
        if(cartDiscount.discount.node.calculatedDiscountValue) {
          this.isValidCurrentDiscount = true;
        } else {
          this.isValidCurrentDiscount = false;
        }
        this.isCheckingDiscountValidation = false;
      }
    } else {
      this.isCheckingDiscountValidation = false;
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
        this.isCheckingDiscountValidation = false;
        const validatedDiscountValue = result.data.validateDiscountsBeforeCheckout.discountValue;
        if(validatedDiscountValue === 0) {
          this.isValidCurrentDiscount = false;
          this.cart.discount = null;
          sessionStorage.setItem('cart', JSON.stringify(this.cart));
        } else {
          this.isValidCurrentDiscount = true;
          this.cart.discount.discount.node.calculatedDiscountValue = validatedDiscountValue;
          sessionStorage.setItem('cart', JSON.stringify(this.cart));
        }
      })
    );
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

  openLoyaltyProgramModal(loyaltyProgramModal) {
    this.modalService.open(loyaltyProgramModal, {backdropClass: 'modal-bottom-backdrop', windowClass: 'loyalty-modal'}).result.then((result) => {
    }, (reason) => {
    });
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
