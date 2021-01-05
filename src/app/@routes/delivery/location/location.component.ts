import { Component, OnInit, ElementRef, NgZone, ViewChild, OnDestroy } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CatalogDeliveryZonesDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import {Apollo} from 'apollo-angular';
import { get } from 'scriptjs';
declare var klokantech;


@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  parentPath: any;
  public latitude: number;
  public longitude: number;
  public zoom = 12;
  private geoCoder;
  deliveryAddress = '';
  catalogId: any;
  slug = '';
  isSavingLocation = false;
  isInvalidDeliveryAddress = false;
  catalogWidgetTheme: any;
  sourceInfluencer: string;

  @ViewChild('search')
  public searchElementRef: ElementRef;

  deliveryAddressForm: FormGroup;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private router: Router,
    public apollo: Apollo
  ) {

    this.slug = sessionStorage.getItem('slug');
    this.catalogId = sessionStorage.getItem('catalogId');
    this.parentPath = sessionStorage.getItem('parentPath');
    this.sourceInfluencer = sessionStorage.getItem('sourceInfluencer');
    this.catalogWidgetTheme = JSON.parse(sessionStorage.getItem('catalogWidgetTheme'));
    document.documentElement.style.setProperty('--theme-color', this.catalogWidgetTheme.widgetTextColor);
    document.documentElement.style.setProperty('--theme-background-color', this.catalogWidgetTheme.widgetBackgroundColor);
  }

  ngOnInit(): void {
    this.deliveryAddressForm = new FormGroup({
      deliveryAddress: new FormControl('')
    });

    this.latitude = 25.199514;
    this.longitude = 55.277397;

    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();

      this.setCurrentPosition();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: []
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {

          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 15;
          this.deliveryAddress = place.formatted_address;
        });
      });
    });
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  selectLocation() {
    this.isSavingLocation = true;
    sessionStorage.setItem('deliveryAddress', this.deliveryAddress);
    sessionStorage.setItem('orderType', 'delivery');
    sessionStorage.setItem('paymentMethod', '');
    sessionStorage.setItem('onlineCardType', '');
    const coordinates = {
      latitude: this.latitude,
      longitude: this.longitude
    };
    sessionStorage.setItem('coordinates', JSON.stringify(coordinates));

    this.getDeliveryZones();
  }

  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 15;
          this.deliveryAddress = results[0].formatted_address;
          this.deliveryAddressForm.controls.deliveryAddress.setValue(this.deliveryAddress);
        } else {
          console.log('No results found');
        }
      } else {
        console.log('Geocoder failed due to: ' + status);
      }

    });
  }

  getDeliveryZones() {
    let deliveryZones = [];
    let minOrderDeliveryZone: any;
    if(this.latitude === 0 && this.longitude === 0) {
      this.isInvalidDeliveryAddress = true;
      this.isSavingLocation = false;
    } else {
      this.subscriptions.push(
        this.apollo.watchQuery({
          query: CatalogDeliveryZonesDocument,
          variables: {
            catalog: this.catalogId,
            latitude: this.latitude,
            longitude: this.longitude
          }
        }).valueChanges.subscribe((response: any) => {
          deliveryZones = response.data.catalogDeliveryZones;
          if(deliveryZones.length > 0) {
            minOrderDeliveryZone = deliveryZones.reduce((accumulator, currentValue) => {
              return (accumulator.minimalAmount < currentValue.minimalAmount) ? accumulator : currentValue;
            });
            sessionStorage.setItem('storeId', minOrderDeliveryZone.store.id);
            sessionStorage.setItem('minOrderDeliveryZone', JSON.stringify(minOrderDeliveryZone));

            if(this.parentPath) {
              this.router.navigate(['/', this.parentPath, this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
            } else {
              this.router.navigate(['/', this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
            }
          } else {
            sessionStorage.setItem('storeId', '');
            sessionStorage.setItem('store', JSON.stringify(null));
            sessionStorage.setItem('minOrderDeliveryZone', JSON.stringify(null));
            if(this.parentPath) {
              this.router.navigate(['/', this.parentPath, this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
            } else {
              this.router.navigate(['/', this.slug], { queryParams: this.sourceInfluencer ? { utm_source: this.sourceInfluencer } : {}, queryParamsHandling: 'merge' });
            }
          }
        },
        (err) => {
          this.isInvalidDeliveryAddress = true;
          this.isSavingLocation = false;
        })
      )
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
