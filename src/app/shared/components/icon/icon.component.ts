import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName = 
  | 'email'
  | 'lock'
  | 'user'
  | 'check'
  | 'alert'
  | 'eye'
  | 'eye-off'
  | 'arrow-left'
  | 'zap'
  | 'users'
  | 'target'
  | 'award'
  | 'plus'
  | 'upload'
  | 'x'
  | 'home'
  | 'chevron-right';

export type IconColor = 'white' | 'sky' | 'blue' | 'red' | 'gray' | 'green' | 'amber';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.viewBox]="'0 0 24 24'"
      fill="none"
      [attr.stroke]="colorValue()"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="'icon icon-' + name()"
    >
      <!-- Email Icon -->
      <g *ngIf="name() === 'email'">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </g>

      <!-- Lock Icon -->
      <g *ngIf="name() === 'lock'">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </g>

      <!-- User Icon -->
      <g *ngIf="name() === 'user'">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </g>

      <!-- Check Icon -->
      <g *ngIf="name() === 'check'">
        <polyline points="20 6 9 17 4 12" />
      </g>

      <!-- Alert Icon -->
      <g *ngIf="name() === 'alert'">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </g>

      <!-- Eye Icon -->
      <g *ngIf="name() === 'eye'">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </g>

      <!-- Eye Off Icon -->
      <g *ngIf="name() === 'eye-off'">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </g>

      <!-- Arrow Left Icon -->
      <g *ngIf="name() === 'arrow-left'">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </g>

      <!-- Zap Icon (Lightning) -->
      <g *ngIf="name() === 'zap'">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </g>

      <!-- Users Icon -->
      <g *ngIf="name() === 'users'">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </g>

      <!-- Target Icon -->
      <g *ngIf="name() === 'target'">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="9" />
      </g>

      <!-- Award Icon -->
      <g *ngIf="name() === 'award'">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8 14 12 17 16 14" />
        <line x1="12" y1="17" x2="12" y2="23" />
        <line x1="9" y1="23" x2="15" y2="23" />
      </g>

      <!-- Plus Icon -->
      <g *ngIf="name() === 'plus'">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </g>

      <!-- Upload Icon -->
      <g *ngIf="name() === 'upload'">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </g>

      <!-- X Icon -->
      <g *ngIf="name() === 'x'">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </g>

      <!-- Home Icon -->
      <g *ngIf="name() === 'home'">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </g>

      <!-- Chevron Right Icon -->
      <g *ngIf="name() === 'chevron-right'">
        <polyline points="9 18 15 12 9 6" />
      </g>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class IconComponent {
  name = input<IconName>('home');
  size = input<string>('24');
  color = input<IconColor>('sky');

  colorValue = computed(() => {
    const colorMap: Record<IconColor, string> = {
      white: '#ffffff',
      sky: '#0ea5e9',
      blue: '#3b82f6',
      red: '#ef4444',
      gray: '#6b7280',
      green: '#10b981',
      amber: '#f59e0b'
    };
    return colorMap[this.color()];
  });
}
