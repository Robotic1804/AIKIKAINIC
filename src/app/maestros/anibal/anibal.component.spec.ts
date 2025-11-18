import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnibalComponent } from './anibal.component';

describe('AnibalComponent', () => {
  let component: AnibalComponent;
  let fixture: ComponentFixture<AnibalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnibalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnibalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
