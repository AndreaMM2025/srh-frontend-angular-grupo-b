import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
})
export class AppComponent {
  private router = inject(Router);
  esInicio = false;

  constructor() {
    this.esInicio = this.router.url === '/' || this.router.url === '';

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.esInicio = e.urlAfterRedirects === '/' || e.urlAfterRedirects === '';
      });
  }
}