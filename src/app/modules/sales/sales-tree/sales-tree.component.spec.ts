import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTreeComponent } from './sales-tree.component';

describe('SalesTreeComponent', () => {
  let component: SalesTreeComponent;
  let fixture: ComponentFixture<SalesTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
