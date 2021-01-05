import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Router, ActivatedRoute } from '@angular/router';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: [ './layout.component.scss' ]
})
export class LayoutComponent implements OnInit {

  private readonly subscriptions = [];

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router
  ) {
    const pathArray = this._router.url.split('/');
    const channel = pathArray[1];
    if(channel === 'f') {
      sessionStorage.setItem('parentPath', channel);
      sessionStorage.setItem('channel', 'facebook');
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          channel: 'facebook'
        },
        queryParamsHandling: 'merge',
      });
    } else if(channel === 'i') {
      sessionStorage.setItem('parentPath', channel);
      sessionStorage.setItem('channel', 'instagram');
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          channel: 'instagram'
        },
        queryParamsHandling: 'merge',
      });
    } else if(channel === 'm') {
      sessionStorage.setItem('parentPath', channel);
      sessionStorage.setItem('channel', 'messenger');
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          channel: 'messenger'
        },
        queryParamsHandling: 'merge',
      });
    } else if(channel === 'w') {
      sessionStorage.setItem('parentPath', channel);
      sessionStorage.setItem('channel', 'whatsapp');
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          channel: 'whatsapp'
        },
        queryParamsHandling: 'merge',
      });
    } else if(channel === 's') {
      sessionStorage.setItem('parentPath', channel);
      sessionStorage.setItem('channel', 'sms');
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          channel: 'sms'
        },
        queryParamsHandling: 'merge',
      });
    } else if(channel === 'e') {
      sessionStorage.setItem('parentPath', channel);
      sessionStorage.setItem('channel', 'email');
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          channel: 'email'
        },
        queryParamsHandling: 'merge',
      });
    } else if(channel === 'g') {
      sessionStorage.setItem('parentPath', channel);
      sessionStorage.setItem('channel', 'google');
      this._router.navigate([], {
        relativeTo: this._activatedRoute,
        queryParams: {
          channel: 'google'
        },
        queryParamsHandling: 'merge',
      });
    } else {
      sessionStorage.setItem('parentPath', '');
      sessionStorage.setItem('channel', '');
    }
  }

  ngOnInit(): void {
    this._activatedRoute.queryParams.subscribe(params => {
      if(params.utm_source) {
        sessionStorage.setItem('sourceInfluencer', params.utm_source);
      } else {
        sessionStorage.setItem('sourceInfluencer', '');
      }
    });
  }
}
