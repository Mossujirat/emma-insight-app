import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LongdoMapComponent } from './longdo-map.component';

describe('LongdoMapComponent', () => {
  let component: LongdoMapComponent;
  let fixture: ComponentFixture<LongdoMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LongdoMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LongdoMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
