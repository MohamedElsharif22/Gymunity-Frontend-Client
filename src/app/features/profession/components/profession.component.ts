import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ProfessionLevel {
  id: number;
  title: string;
  description: string;
  benefits: string[];
  icon: string;
  color: string;
}

@Component({
  selector: 'app-profession',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <!-- Ambient Background -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-sky-500 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10">
        <!-- Header -->
        <section class="py-20 px-4 sm:px-6 lg:px-8">
          <div class="max-w-6xl mx-auto text-center animate-fadeIn">
            <a routerLink="/home" class="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-8">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Home
            </a>

            <h1 class="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-6">
              Become a Professional Trainer
            </h1>
            <p class="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our growing network of certified trainers and help thousands achieve their fitness goals. Share your expertise and build your coaching career.
            </p>
          </div>
        </section>

        <!-- Profession Levels -->
        <section class="py-20 px-4 sm:px-6 lg:px-8">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16 animate-slideDown">
              <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">
                Choose Your Level
              </h2>
              <p class="text-lg text-slate-300">Select the professional tier that matches your experience and goals</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              @for (level of professionLevels; track level.id; let i = $index) {
                <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-sky-500/50 transition-all duration-300 animate-slideDown group" [style]="{'animation-delay': (i * 100) + 'ms'}">
                  <!-- Header -->
                  <div [ngClass]="'p-6 border-b border-white/10 ' + level.color">
                    <div class="text-5xl mb-4">{{ level.icon }}</div>
                    <h3 class="text-2xl font-black text-white">{{ level.title }}</h3>
                    <p class="text-slate-300 text-sm mt-2">{{ level.description }}</p>
                  </div>

                  <!-- Benefits -->
                  <div class="p-6">
                    <h4 class="text-sm font-bold text-slate-200 uppercase tracking-wide mb-4">Benefits Include:</h4>
                    <ul class="space-y-3">
                      @for (benefit of level.benefits; track benefit) {
                        <li class="flex items-start gap-3">
                          <svg class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-slate-300 text-sm">{{ benefit }}</span>
                        </li>
                      }
                    </ul>
                  </div>

                  <!-- Button -->
                  <div class="p-6 bg-white/5 border-t border-white/10">
                    <button
                      (click)="selectLevel(level.id)"
                      class="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 p-1 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/50 active:scale-95">
                      <div class="relative bg-slate-900 rounded-[6px] px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-sm font-bold text-white">
                        Get Started
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Requirements Section -->
        <section class="py-20 px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-16 animate-slideDown">
              <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">
                Requirements
              </h2>
            </div>

            <div class="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-8 animate-slideDown" style="animation-delay: 0.2s;">
              <div class="space-y-6">
                <div class="flex gap-4">
                  <div class="flex-shrink-0">
                    <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-sky-500/20 border border-sky-500/50">
                      <span class="text-sky-300 font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">Certification</h3>
                    <p class="text-slate-300 mt-2">Valid personal training or fitness coaching certification from an accredited organization (NASM, ACE, ISSA, etc.)</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex-shrink-0">
                    <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
                      <span class="text-emerald-300 font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">Experience</h3>
                    <p class="text-slate-300 mt-2">Minimum 2 years of professional training experience. Document your track record and client testimonials.</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex-shrink-0">
                    <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-500/20 border border-violet-500/50">
                      <span class="text-violet-300 font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">Professional Background</h3>
                    <p class="text-slate-300 mt-2">Clear background check and valid government ID. Commitment to professional ethics and client safety.</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex-shrink-0">
                    <div class="flex items-center justify-center h-10 w-10 rounded-lg bg-pink-500/20 border border-pink-500/50">
                      <span class="text-pink-300 font-bold">4</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">Professional Profile</h3>
                    <p class="text-slate-300 mt-2">Create a detailed professional profile with your expertise, specialties, certifications, and pricing.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Call to Action -->
        <section class="py-20 px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto">
            <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500/20 to-emerald-500/20 backdrop-blur-md border border-sky-500/50 p-12 text-center animate-slideDown" style="animation-delay: 0.3s;">
              <h2 class="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready to Share Your Expertise?
              </h2>
              <p class="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join hundreds of professional trainers earning great income while helping clients achieve their fitness dreams.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  (click)="startApplication()"
                  class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 p-1 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/50 active:scale-95">
                  <div class="relative bg-slate-900 rounded-[6px] px-8 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-sm font-bold text-white">
                    Apply Now
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </div>
                </button>
                <a
                  href="mailto:support@gymunity.com"
                  class="group relative overflow-hidden rounded-lg border-2 border-slate-600 hover:border-slate-500 p-1 transition-all duration-300 active:scale-95">
                  <div class="relative bg-slate-900 rounded-[6px] px-8 py-3 flex items-center justify-center gap-2 group-hover:bg-opacity-80 transition-all text-sm font-bold text-white">
                    Contact Support
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep {
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }

      .animate-slideDown {
        animation: slideDown 0.5s ease-out forwards;
        opacity: 0;
      }
    }
  `]
})
export class ProfessionComponent {
  selectedLevel = signal<number | null>(null);

  professionLevels: ProfessionLevel[] = [
    {
      id: 1,
      title: 'Starter',
      description: 'Perfect for emerging trainers',
      icon: '🌱',
      color: 'bg-sky-500/10',
      benefits: [
        'Up to 50 active clients',
        'Basic analytics dashboard',
        'Client management tools',
        'Email support',
        '30% commission rate',
        'Starter profile featured'
      ]
    },
    {
      id: 2,
      title: 'Professional',
      description: 'For experienced trainers',
      icon: '⭐',
      color: 'bg-emerald-500/10',
      benefits: [
        'Up to 200 active clients',
        'Advanced analytics & insights',
        'Video tutorial uploads',
        'Priority email & chat support',
        '35% commission rate',
        'Premium profile positioning',
        'Custom branding'
      ]
    },
    {
      id: 3,
      title: 'Elite',
      description: 'For top-tier trainers',
      icon: '🏆',
      color: 'bg-violet-500/10',
      benefits: [
        'Unlimited active clients',
        'Complete analytics suite',
        'Live class hosting',
        '24/7 dedicated support',
        '40% commission rate',
        'Featured elite badge',
        'Marketing assistance',
        'Custom integrations'
      ]
    }
  ];

  selectLevel(levelId: number) {
    this.selectedLevel.set(levelId);
    // Navigate to application form or show registration dialog
    console.log('Selected profession level:', levelId);
  }

  startApplication() {
    if (!this.selectedLevel()) {
      console.log('Please select a level first');
      return;
    }
    // Navigate to application form with selected level
    console.log('Starting application for level:', this.selectedLevel());
  }
}
