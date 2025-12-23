import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Bookings</h1>
      <div class="card">
        <p class="text-gray-500">Manage your trainer sessions and bookings.</p>
      </div>
    </div>
  `
})
export class BookingsComponent {}
