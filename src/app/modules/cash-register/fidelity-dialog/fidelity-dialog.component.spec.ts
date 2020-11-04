import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FidelityDialogComponent } from './fidelity-dialog.component';

describe('FidelityDialogComponent', () => {
  let component: FidelityDialogComponent;
  let fixture: ComponentFixture<FidelityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FidelityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FidelityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
