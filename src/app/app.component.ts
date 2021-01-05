import { Component, OnInit } from '@angular/core';
import { SettingsService } from './@core/services/settings/settings.service';
import { Router, NavigationEnd } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

// tslint:disable-next-line:ban-types
declare let fbq:Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {

  private readonly subscriptions = [];
  allowedLangs = ['en', 'it'];

  constructor(private router: Router, private translate: TranslateService){
    translate.setDefaultLang('en');
    let item = localStorage.getItem('lang');
    if (!item) {
      let userLang = navigator.language || window.navigator.language;
      userLang = userLang.substr(0, 2);
      if (this.allowedLangs.indexOf(userLang) === -1)
        userLang = 'en';
      item = userLang;
      localStorage.setItem('lang', item);
    }
    this.translate.use(item);
  }

  ngOnInit(): void {
    document.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        e.preventDefault();
      }
    });
  }
}
