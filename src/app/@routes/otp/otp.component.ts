import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestPhoneAccessTokenGQL } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { VerifyOtpCodeGQL } from '@app/@core/graphql/operations/customer/mutation.ops.g';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import {Apollo} from 'apollo-angular';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  slug = '';
  parentPath: any;

  phoneForm: FormGroup;
  otpCode: FormControl;

  separateDialCode = false;
	SearchCountryField = SearchCountryField;
	TooltipLabel = TooltipLabel;
	CountryISO = CountryISO;

  isTokenLoading = false;
  isResendCode = false;
  startCountDown = false;
  counter = 30;
  interval: any;
  isErrorPhoneNumberVerification = false;
  isErrorCodeVerification = false;
  pixelID: any;

  page = 0;
  selectedCountryISO = CountryISO.UnitedArabEmirates;
  currentLang: any;
  catalogWidgetTheme: any;
  sourceInfluencer: string;

  constructor(
    private router: Router,
    private requestPhoneAccessTokenGQL: RequestPhoneAccessTokenGQL,
    private verifyOtpCodeGQL: VerifyOtpCodeGQL,
    public apollo: Apollo
  ) {
    this.slug = sessionStorage.getItem('slug');
    this.pixelID = sessionStorage.getItem('pixelID');
    this.parentPath = sessionStorage.getItem('parentPath');
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
    this.currentLang = localStorage.getItem('lang');
    this.catalogWidgetTheme = JSON.parse(sessionStorage.getItem('catalogWidgetTheme'));
    document.documentElement.style.setProperty('--theme-color', this.catalogWidgetTheme.widgetTextColor);
    document.documentElement.style.setProperty('--theme-background-color', this.catalogWidgetTheme.widgetBackgroundColor);
    if(this.currentLang === 'en') {
      this.selectedCountryISO = CountryISO.UnitedArabEmirates;
    }
    else if(this.currentLang === 'it') {
      this.selectedCountryISO = CountryISO.Italy;
    }
  }

  ngOnInit(): void {
    this.phoneForm = new FormGroup({
      phoneNumber: new FormControl('', [Validators.required])
    });
    this.otpCode = new FormControl('', Validators.required);

    if(this.pixelID) {
      this.trackingPages(this.pixelID);
    }
  }

  continue() {
    if(!this.isErrorPhoneNumberVerification) {
      this.isResendCode = false;
      this.isTokenLoading = true;
      this.isErrorCodeVerification = false;
      this.subscriptions.push(
        this.requestPhoneAccessTokenGQL
          .mutate({
            phoneNumber: this.phoneForm.value.phoneNumber.internationalNumber,
            locale: this.currentLang
          })
          .subscribe(result => {
            this.startCountdown();
            this.isTokenLoading = false;
            this.page = 1;
          },
          (err) => {
            this.isErrorPhoneNumberVerification = true;
            this.isTokenLoading = false;
          })
      )
    }
  }

  verifyOTPCode() {
    this.isTokenLoading = true;
    this.subscriptions.push(
      this.verifyOtpCodeGQL
        .mutate({
          phoneNumber: this.phoneForm.value.phoneNumber.internationalNumber,
          code: this.otpCode.value
        })
        .subscribe(result => {
          localStorage.setItem('otp_token', result.data.fetchPhoneAccessToken);
          this.stopCountdown();
          this.isTokenLoading = false;
          if(this.parentPath) {
            this.router.navigate(['/', this.parentPath, this.slug, 'checkout'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
          } else {
            this.router.navigate(['/', this.slug, 'checkout'], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
          }
        },
        (err) => {
          this.isErrorCodeVerification = true;
          this.isTokenLoading = false;
          this.stopCountdown();
          this.isResendCode = true;
        })
    )
  }

  startCountdown() {
    this.startCountDown = true;
    this.isResendCode = false;
    this.counter = 30;
    this.interval = setInterval(() => {

      this.counter--;

      if (this.counter < 0 ) {
        this.isResendCode = true;
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown() {
    this.startCountDown = false;
    clearInterval(this.interval);
  }

  checkPhoneNumberValidation($event) {
    if($event.target.value.length > 13) {
      this.isErrorPhoneNumberVerification = true;
    } else {
      this.isErrorPhoneNumberVerification = false;
    }
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
