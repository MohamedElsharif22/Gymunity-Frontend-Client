import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Professional Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center gap-3 flex-shrink-0 cursor-pointer" (click)="navigateHome()">
            <div class="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Gymunity</span>
          </div>

          <!-- Desktop Navigation Links -->
          <div class="hidden md:flex items-center gap-8">
            <a [routerLink]="['/discover/trainers']" class="text-gray-700 hover:text-sky-600 font-medium transition">Trainers</a>
            <a [routerLink]="['/discover/programs']" class="text-gray-700 hover:text-sky-600 font-medium transition">Programs</a>
            <a href="#" class="text-gray-700 hover:text-sky-600 font-medium transition">About</a>
            <a href="#" class="text-gray-700 hover:text-sky-600 font-medium transition">Contact</a>
          </div>

          <!-- Desktop Auth Buttons -->
          <div class="hidden md:flex items-center gap-4">
            @if (isAuthenticated()) {
              <button
                [routerLink]="['/dashboard']"
                class="text-sky-600 hover:text-sky-700 font-medium transition">
                Dashboard
              </button>
              <button
                [routerLink]="['/profile']"
                class="text-gray-700 hover:text-sky-600 font-medium transition">
                Profile
              </button>
              <button
                (click)="logout()"
                class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                Logout
              </button>
            } @else {
              <button
                [routerLink]="['/auth/login']"
                class="text-sky-600 hover:text-sky-700 font-medium transition">
                Sign In
              </button>
              <button
                [routerLink]="['/auth/register']"
                class="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                Get Started
              </button>
            }
          </div>

          <!-- Mobile Menu Button -->
          <button
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            [attr.aria-label]="mobileMenuOpen() ? 'Close menu' : 'Open menu'">
            @if (!mobileMenuOpen()) {
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            } @else {
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            }
          </button>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden bg-white border-t border-gray-200">
            <div class="px-2 pt-2 pb-4 space-y-1">
              <a [routerLink]="['/discover/trainers']" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">Trainers</a>
              <a [routerLink]="['/discover/programs']" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">Programs</a>
              <a href="#" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">About</a>
              <a href="#" (click)="closeMobileMenu()" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">Contact</a>
              <div class="border-t border-gray-200 pt-4 mt-4 space-y-2">
                @if (isAuthenticated()) {
                  <button
                    [routerLink]="['/dashboard']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
                    Dashboard
                  </button>
                  <button
                    [routerLink]="['/profile']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
                    Profile
                  </button>
                  <button
                    (click)="logout()"
                    class="block w-full text-left px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium">
                    Logout
                  </button>
                } @else {
                  <button
                    [routerLink]="['/auth/login']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition font-medium">
                    Sign In
                  </button>
                  <button
                    [routerLink]="['/auth/register']"
                    (click)="closeMobileMenu()"
                    class="block w-full text-left px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition font-medium">
                    Get Started
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Add padding-top to account for fixed navbar -->
    <div class="pt-16"></div>

    <!-- Main Content -->
    <router-outlet></router-outlet>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Top Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Brand Info -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Gymunity
              </h3>
            </div>
            <p class="text-gray-600 text-sm mb-4 max-w-sm">
              Your ultimate fitness companion. Track workouts, monitor progress, and achieve your fitness goals with ease.
            </p>
            <div class="flex gap-3">
              <a href="#" class="w-10 h-10 bg-gradient-to-br from-sky-100 to-indigo-100 hover:from-sky-200 hover:to-indigo-200 rounded-lg flex items-center justify-center transition group">
                <svg class="w-5 h-5 text-sky-600 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 bg-gradient-to-br from-sky-100 to-indigo-100 hover:from-sky-200 hover:to-indigo-200 rounded-lg flex items-center justify-center transition group">
                <svg class="w-5 h-5 text-sky-600 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 bg-gradient-to-br from-sky-100 to-indigo-100 hover:from-sky-200 hover:to-indigo-200 rounded-lg flex items-center justify-center transition group">
                <svg class="w-5 h-5 text-sky-600 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-bold text-gray-100 mb-4">Quick Links</h4>
            <ul class="space-y-3">
              <li><a [routerLink]="['/auth/register']" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Get Started</a></li>
              <li><a [routerLink]="['/discover/programs']" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Programs</a></li>
              <li><a [routerLink]="['/discover/trainers']" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Trainers</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Classes</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="font-bold text-gray-100 mb-4">Support</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Help Center</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Contact Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Privacy Policy</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Terms of Service</a></li>
            </ul>
          </div>

          <!-- Company -->
          <div>
            <h4 class="font-bold text-gray-100 mb-4">Company</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">About Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Blog</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Careers</a></li>
              <li><a href="#" class="text-gray-400 hover:text-sky-400 transition text-sm font-medium">Press</a></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-600 text-sm">
            © 2024 Gymunity. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-gray-600 hover:text-sky-400 transition text-sm font-medium">Privacy</a>
            <a href="#" class="text-gray-600 hover:text-sky-400 transition text-sm font-medium">Terms</a>
            <a href="#" class="text-gray-600 hover:text-sky-400 transition text-sm font-medium">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class GuestLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/auth/login']);
  }

  navigateHome(): void {
    this.router.navigate(['/landing']);
    this.closeMobileMenu();
  }
}
