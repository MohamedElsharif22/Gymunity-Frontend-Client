import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  showLayout = signal(true);
  private router = inject(Router);

  ngOnInit() {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const isFullscreen = this.checkFullscreenRoute(this.router.routerState.root);
      this.showLayout.set(!isFullscreen);
    });
  }

  private checkFullscreenRoute(route: any): boolean {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data['fullscreen'] === true;
  }
}
