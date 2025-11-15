import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.css'],
})
export class VideoSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  isPlaying = signal(false);
  isPaused = signal(false);
  videoProgress = signal(0);

  private observer?: IntersectionObserver;

  playVideo() {
    const video = this.videoPlayer.nativeElement;
    video.play();
    video.muted = false;
    this.isPlaying.set(true);
    this.isPaused.set(false);
    this.updateProgress();
  }

  togglePlay() {
    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play();
      this.isPaused.set(false);
    } else {
      video.pause();
      this.isPaused.set(true);
    }
  }

  stopVideo() {
    const video = this.videoPlayer.nativeElement;
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    this.isPlaying.set(false);
    this.isPaused.set(false);
    this.videoProgress.set(0);
  }

  private updateProgress() {
    const video = this.videoPlayer.nativeElement;
    const interval = setInterval(() => {
      if (!this.isPlaying()) {
        clearInterval(interval);
        return;
      }
      const progress = (video.currentTime / video.duration) * 100;
      this.videoProgress.set(progress);
    }, 100);
  }

  ngAfterViewInit() {
    // Auto-play when video scrolls into view
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isPlaying()) {
            // Auto-play muted when in view
            const video = this.videoPlayer.nativeElement;
            video.muted = true;
            video.play().catch(() => {
              // If autoplay fails, just keep it ready
            });
          }
        });
      },
      { threshold: 0.5 } // Play when 50% visible
    );

    this.observer.observe(this.videoPlayer.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
