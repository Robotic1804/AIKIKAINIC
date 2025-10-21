import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent implements OnInit {
  countdown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  progressValue = 65;
  isSubscribed = false;
  email = '';

  constructionIcons = [
    { class: 'fas fa-hammer text-3xl text-yellow-300' },
    { class: 'fas fa-wrench text-3xl text-blue-300' },
    { class: 'fas fa-cog text-3xl text-green-300' }
  ];

  socialLinks = [
    { url: '#', icon: 'fab fa-facebook text-2xl' },
    { url: '#', icon: 'fab fa-twitter text-2xl' },
    { url: '#', icon: 'fab fa-instagram text-2xl' }
  ];

  ngOnInit() {
    this.startCountdown();
  }

  startCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      this.countdown = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  subscribe() {
    if (this.email && this.validateEmail(this.email)) {
      this.isSubscribed = true;
      // Aquí iría la lógica para enviar el email
      console.log('Email registrado:', this.email);
      this.email = '';
    }
  }

  private validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}


