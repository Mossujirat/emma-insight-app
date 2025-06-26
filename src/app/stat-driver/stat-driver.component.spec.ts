import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatDriverComponent } from './stat-driver.component';

describe('StatDriverComponent', () => {
  let component: StatDriverComponent;
  let fixture: ComponentFixture<StatDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatDriverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
