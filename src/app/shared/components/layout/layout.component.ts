import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col relative overflow-hidden">
      <!-- Background Decoration -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <!-- Gradient Orbs -->
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-sky-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
        <div class="absolute -bottom-40 right-1/3 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 4s;"></div>
        
        <!-- Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>

      <!-- Header -->
      <app-header></app-header>

      <!-- Main Content -->
      <div class="flex flex-1 relative z-10 mt-16 md:mt-20">
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>

        <!-- Page Content Area -->
        <main class="flex-1 overflow-auto md:ml-72">
          <!-- Content Wrapper with Padding and Max Width -->
          <div class="relative">
            <!-- Scroll to Top Button -->
            <button 
              *ngIf="showScrollTop()"
              (click)="scrollToTop()"
              class="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 group"
              aria-label="Scroll to top">
              <svg class="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </button>

            <!-- Page Content -->
            <div class="min-h-[calc(100vh-4rem)]">
              <router-outlet></router-outlet>
            </div>

            <!-- Minimized Footer for Authenticated Pages -->
            <footer class="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 backdrop-blur-sm">
              <div class="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <p class="text-gray-600 text-sm">
                      © 2024 Gymunity
                    </p>
                  </div>
                  <div class="flex items-center gap-6">
                    <a href="#" class="text-gray-600 hover:text-sky-600 transition text-sm font-medium">Privacy</a>
                    <a href="#" class="text-gray-600 hover:text-sky-600 transition text-sm font-medium">Terms</a>
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
  `]
})
export class LayoutComponent {
  showScrollTop = signal(false);

  constructor() {
    // Listen for scroll events
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showScrollTop.set(window.scrollY > 300);
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}