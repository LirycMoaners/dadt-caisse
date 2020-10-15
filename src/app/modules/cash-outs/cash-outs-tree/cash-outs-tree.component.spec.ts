import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashOutsTreeComponent } from './cash-outs-tree.component';

describe('CashOutsTreeComponent', () => {
  let component: CashOutsTreeComponent;
  let fixture: ComponentFixture<CashOutsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashOutsTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashOutsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
