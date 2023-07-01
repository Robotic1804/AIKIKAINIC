import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AikidoComponent } from './aikido.component';

describe('AikidoComponent', () => {
  let component: AikidoComponent;
  let fixture: ComponentFixture<AikidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AikidoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AikidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
