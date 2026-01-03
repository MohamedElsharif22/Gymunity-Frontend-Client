import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionsListComponent } from './subscriptions-list/subscriptions-list.component';

@Component({
  selector: 'app-memberships',
  standalone: true,
  imports: [CommonModule, SubscriptionsListComponent],
  template: `
    <app-subscriptions-list></app-subscriptions-list>
  `
})
export class MembershipsComponent {}
