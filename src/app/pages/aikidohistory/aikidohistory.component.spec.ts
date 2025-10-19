import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AikidohistoryComponent } from './aikidohistory.component';

describe('AikidohistoryComponent', () => {
  let component: AikidohistoryComponent;
  let fixture: ComponentFixture<AikidohistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AikidohistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AikidohistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
