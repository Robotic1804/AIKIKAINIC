import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-section.component.html',
  styleUrls: ['./welcome-section.component.css'],
})
export class WelcomeSectionComponent {
  // Animación para el texto rotativo
  currentTextIndex = signal(0);
  rotatingTexts = [
    'encontrarás paz interior',
    'descubrirás tu fuerza',
    'hallarás equilibrio',
    'conectarás con tu energía',
    'encontrarás disciplina',
  ];

  constructor() {
    this.startTextRotation();
  }

  private startTextRotation() {
    setInterval(() => {
      this.currentTextIndex.update((i) => (i + 1) % this.rotatingTexts.length);
    }, 3000);
  }
}
