import { Injectable } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy({ arrayName: 'subscriptions' })
@Injectable()
export class SettingsService {

  private readonly subscriptions = [];

  constructor() {
  }
}
