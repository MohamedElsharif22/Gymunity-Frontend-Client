import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col relative overflow-hidden" [class.fullscreen]="isFullscreen()">
      <!-- Background Decoration -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden" *ngIf="!isFullscreen()">
        <!-- Gradient Orbs -->
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-sky-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
        <div class="absolute -bottom-40 right-1/3 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 4s;"></div>

        <!-- Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>

      <!-- Header -->
      <app-header *ngIf="!isFullscreen()" (toggleSidebar)="toggleSidebar()"></app-header>

      <!-- Main Content -->
      <div class="flex flex-1 relative z-10" [class.pt-14]="!isFullscreen()" [class.sm:pt-16]="!isFullscreen()" [class.md:pt-20]="!isFullscreen()">
        <!-- Sidebar -->
        <app-sidebar 
          *ngIf="!isFullscreen()" 
          [isCollapsed]="sidebarCollapsed()"
          [isSidebarOpen]="sidebarOpen()"
          (onCloseSidebar)="closeSidebar()"
        ></app-sidebar>

        <!-- Page Content Area -->
        <main class="flex-1 overflow-auto transition-all duration-300" [ngClass]="{
          'lg:ml-72': !isFullscreen() && !sidebarCollapsed(),
          'lg:ml-20': !isFullscreen() && sidebarCollapsed(),
          'ml-0': isFullscreen()
        }">
          <!-- Content Wrapper with Padding and Max Width -->
          <div class="relative">
            <!-- Scroll to Top Button -->
            <button
              *ngIf="showScrollTop() && !isFullscreen()"
              (click)="scrollToTop()"
              class="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 group"
              aria-label="Scroll to top">
              <svg class="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </button>

            <!-- Page Content -->
            <div [class.min-h-screen]="isFullscreen()" [class.min-h-[calc(100vh-4rem)]]="!isFullscreen()">
              <router-outlet></router-outlet>
            </div>

            <!-- Minimized Footer for Authenticated Pages -->
            <footer *ngIf="!isFullscreen()" class="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 backdrop-blur-sm">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                <div class="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
                  <div class="flex items-center gap-2 sm:gap-3">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <p class="text-gray-600 text-xs sm:text-sm">
                      © 2024 Gymunity
                    </p>
                  </div>
                  <div class="flex items-center gap-3 sm:gap-6">
                    <a href="#" class="text-gray-600 hover:text-sky-600 transition text-xs sm:text-sm font-medium">Privacy</a>
                    <a href="#" class="text-gray-600 hover:text-sky-600 transition text-xs sm:text-sm font-medium">Terms</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    :host.fullscreen {
      height: 100vh;
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  showScrollTop = signal(false);
  isFullscreen = signal(false);
  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);

  constructor() {
    // Listen for scroll events
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showScrollTop.set(window.scrollY > 300);
      });
    }
  }

  ngOnInit(): void {
    // Check initial route
    this.updateFullscreenState();

    // Listen for route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateFullscreenState();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFullscreenState(): void {
    const route = this.router.routerState;

    // Recursively check all routes for fullscreen flag
    const checkRoute = (node: any): boolean => {
      if (!node) return false;

      // Check the snapshot data (synchronous access to route data)
      if (node.snapshot && node.snapshot.data && node.snapshot.data['fullscreen']) {
        return true;
      }

      // Check first child (active route child)
      if (node.firstChild && checkRoute(node.firstChild)) {
        return true;
      }

      return false;
    };

    const isFullscreen = checkRoute(route.root);
    this.isFullscreen.set(isFullscreen);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
