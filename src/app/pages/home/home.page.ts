import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.page.html',
})
export class HomePage {}