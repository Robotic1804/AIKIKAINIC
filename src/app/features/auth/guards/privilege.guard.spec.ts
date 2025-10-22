import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { privilegeGuard } from './privilege.guard';

describe('privilegeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => privilegeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
