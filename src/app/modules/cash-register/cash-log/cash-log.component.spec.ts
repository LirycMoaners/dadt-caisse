import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashLogComponent } from './cash-log.component';

describe('CashLogComponent', () => {
  let component: CashLogComponent;
  let fixture: ComponentFixture<CashLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
