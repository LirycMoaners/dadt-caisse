import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashLogPrintDialogComponent } from './cash-log-print-dialog.component';

describe('CashLogPrintDialogComponent', () => {
  let component: CashLogPrintDialogComponent;
  let fixture: ComponentFixture<CashLogPrintDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashLogPrintDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashLogPrintDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
