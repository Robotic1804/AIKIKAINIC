import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AikiFaceComponent } from './aiki-face.component';

describe('AikiFaceComponent', () => {
  let component: AikiFaceComponent;
  let fixture: ComponentFixture<AikiFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AikiFaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AikiFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
