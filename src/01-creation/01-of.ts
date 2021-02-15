// of<T>(...args: (SchedulerLike | T)[]): Observable<T>

import { of, asyncScheduler } from 'rxjs';
import { addItem, run } from './../03-utils';

export function ofDemo1() {
  const stream$ = of(5);

  // run(stream$);
}

export function ofDemo2() {
  const stream$ = of(1, 2, 3, 4, 5); // Each argument becomes a next notification.

  // run(stream$);
  // addItem('Next line of code');
}

export function ofDemo3() {
  const stream$ = of(1, 2, 3, 4, 5, asyncScheduler); // Each argument becomes a next notification.

  // run(stream$);
  // addItem('Next line of code');
}
