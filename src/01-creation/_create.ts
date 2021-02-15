// signature:   create(subscribe: function);
// description: Create an observable with given subscription function.

import { Observable, Observer} from 'rxjs';

export function createObservableDemo() {
 

  // This is only definition of the stream
  const http$ = Observable.create((observer: Observer<any>) => {
    console.log(
      'Custom observable with fetch method, created using create method'
    );

    fetch('https://api.github.com/users')
      .then(response => response.json())
      .then(body => {
        observer.next(body);
        observer.complete();
      })
      .catch(err => observer.error(err));
  });

  // case 1
  const observer: Observer<any> = {
    next: (value: any) => console.log(`Next:`, value),
    error: error => console.log(`Error: ${error}`),
    complete: () => console.log(`Complete!`)
  };

  // const sub = http$.subscribe(observer);

  // case 2
  // const sub = http$.subscribe(
  //   value => console.log(`Next:`, value),
  //   error => console.log(`Error: ${error}`),
  //   () => console.log(`Complete!`)
  // );
}
