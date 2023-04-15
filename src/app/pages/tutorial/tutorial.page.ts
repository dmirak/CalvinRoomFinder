import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {

  constructor(private route: Router) { }

  onSlideChanged() {
    const slides = document.querySelectorAll('.swiper-slide');
    const currentSlide = Array.from(slides).findIndex((slide: HTMLElement) => slide.classList.contains('swiper-slide-active'));
    if (currentSlide === slides.length - 1) {
      setTimeout(() => {
        this.nextpage();
      }, 3000);
    }
  }

  nextpage() {
    this.route.navigate(['']);
  }

  ngOnInit() {
  }

}
