import { Observable, of, from, fromEvent, generate, pairs, EMPTY, concat, timer, zip, range, bindCallback, bindNodeCallback, fromEventPattern, interval, NEVER, throwError, defer, iif } from "rxjs";
import { map, take, tap, switchMap, filter, reduce, catchError, delay, concatMap, withLatestFrom, pluck, flatMap, bufferTime, bufferCount, groupBy, mergeMap } from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { addItem, run } from './../03-utils';

// Task 1. of()
// Реализуйте тело функции, которая принимает переменное количество параметров 
// и создает Observable, который выдает значения ее аргументов
(function task1(...rest: any[]): void {
    const stream$ = of(...rest);

    //run(stream$);
})(1, 'string', true, {});

// Task 2.1 from()
// Реализуйте тело функции, которая принимает на вход массив и создает Observable,
// который выдает значения этого массива
(function task2(arr: any[]): void {
    const stream$ = from(arr);

    //run(stream$);
})([1, 'string', true, {}]);


// Task 2.2. from()
// Реализуйте тело функции, которая создает Observable, который выдает случайные числа в дианазоне от min до max
// используя генератор. Верните 10 чисел, используя take()
(function task3() {
    function* generator(min, max) {
        while (true) {
            yield Math.floor(Math.random() * (max - min)) + min;
        }
    }

    const stream$ = from(generator(0, 10)).pipe(take(10));

    //run(stream$);
})();

// Task 3 fromEvent()
// Реализуйте тело функции, которая принимает 
// id кнопки и создает Observable, который выдает значения времени клика по кнопке
(function task3(buttonId: string): void {

    const stream$ = fromEvent(document.getElementById(buttonId), "click")
        .pipe(map(event => new Date().toLocaleString()))

    //run(stream$);
})('runBtn');

// Task 4. fromEventPattern()
// Реализуйте функцию, которая создаст Observable, который выдает значения,
// передаваемые вызову методу emit();
(function task4() {
    class С1 {
        private listeners: Function[] = [];

        registerListener(listener: Function) {
            this.listeners.push(listener);
        }

        emit(value: any) {
            this.listeners.forEach(listener => listener(value));
        }
    }

    const foo = new С1();

    const stream$ = fromEventPattern(listener => foo.registerListener(listener));

    //run(stream$);

    foo.emit(1);
    foo.emit(2);
    foo.emit(3);
})();



// Task 5. fromFetch()
// Реализуйте функцию, которая создает Observable, который выдает имена пользователей. 
// Используйте операторы: fromFetch('http://jsonplaceholder.typicode.com/users'), filter(), switchMap(), map()
(function task5() {
    const stream$ = fromFetch('http://jsonplaceholder.typicode.com/users')
        .pipe(
            filter((response: Response) => response.ok),
            switchMap((response: Response) => response.json()),
            map((users: any[]) => users.map(user => user.name)),
            switchMap((names: string[]) => from(names))
        );

    //run(stream$);
})();

// Task 6. ajax() // Artem Onopriienko
// Получить пользователей, сформировать объекты { name: ..., email: ...} и отсортировать их по массиву из 2 полей
// const fields$ = from(['name', 'email']);
// Используйте операторы: ajax('http://jsonplaceholder.typicode.com/users'), switchMap(), map(), withLatestFrom()
(function task6() {
    const fields$ = from(['name', 'email'])
    const stream$ = ajax('http://jsonplaceholder.typicode.com/users')
        .pipe(
            pluck('response'),
            map((data: any[]) => data.map(elem => ({ name: elem.name, email: elem.email }))),
            withLatestFrom(fields$.pipe(reduce((acc, elem) => { acc.push(elem); return acc; }, []))),
            // withLatestFrom(fields$.pipe(pairwise())),
            tap(data => console.log(data)),

            map(arr => {  // [ [{}, {}, ...], [f1, f2]]
                const [data, fields] = arr;

                data.sort((el1, el2) => {
                    const [field1] = fields;
                    return el1[field1].localeCompare(el2[field1]);
                });

                data.sort((el1, el2) => {
                    const [field1, field2] = fields;
                    if (el1[field1] === el2[field1]) {
                        return el1[field2].localeCompare(el2[field2]);
                    } else {
                        return 0;
                    }

                });

                return data;
            }),

            switchMap(data => from(data))
        );

    //run(stream$);
})();

// Task7. interval()
// Реализуйте функцию, которая создает Observable, который запрашивает и выдает имена ползователей каждые 5с 
// Используйте операторы: ajax('http://jsonplaceholder.typicode.com/users'), switchMap(), map()
(function task7() {
    // const stream$ = interval(5000)
    //     .pipe(
    //         switchMap(() => ajax('http://jsonplaceholder.typicode.com/users')),
    //         switchMap((response: AjaxResponse) => from(response.response).pipe(take(Math.floor(Math.random() * (5 - 1)) + 1))),
    //         map((data: any) => data.name),
    //     )''

    const stream$ = interval(5000)
        .pipe(
            take(5),
            switchMap(() => ajax('http://jsonplaceholder.typicode.com/users')),
        )


    //run(stream$);
})();

// Task 8. from(), timer(), zip()
// Реализуйте функцию, которая создает Observable, который выдает элементы массива каждые 2с 
// Создайте поток на основе массива items, используя from()
// Создайте поток, который будет выдавать значение каждые 2с, используя timer()
// Объедините эти потоки, используя zip
(function task8() {
    const items = [1, 2, 3, 4, 5];
    const stream$ = zip(
        from(items),
        timer(2000, 2000)
    ).pipe(
        map(data => data[0])
    )

    //run(stream$);
})();

// Task 9. range()
// Реализуйте функцию, которая создает Observable, который выдает числа в диапазоне от 1 до 10 
// через случайное количество времени в диапазоне от 1с до 5с
// Используйте функцию randomDelay(), of(), concatMap(), delay()
(function task9() {
    function randomDelay(min: number, max: number) {
        const pause = Math.floor(Math.random() * (max - min)) + min;
        console.log(pause);
        return pause;
    }

    const stream$ = range(1, 10)
        .pipe(
            concatMap(n => of(n).pipe(delay(randomDelay(1000, 5000))))
        );

    //run(stream$);
})();

// Task 10. pairs()
// Реализуйте функцию, которая создает Observable.
// Пусть есть поток objAddressStream, который выдает объект и второй поток fieldsStream, который содержит перечень ключей объекта
// Необходимо модифицировать поток так, чтобы он выдавал объект только с данными ключей из 
// второго потока. 
// Используйте pairs(), switchMap(), reduce(), filter(), withLatestFrom()
(function task10() {
    const objAddressStream = of({
        country: 'Ukraine',
        city: 'Kyiv',
        index: '02130',
        street: 'Volodymyra Velikogo',
        build: 100,
        flat: 23
    });

    const fieldsStream = from(['country', 'street', 'flat']);

    // const stream$ = objAddressStream
    //     .pipe(
    //         withLatestFrom(fieldsStream.pipe(reduce((acc, elem) => { acc.push(elem); return acc; }, []))),
    //         map(data => {
    //             const [obj, fields] = data;
    //             const result = {};
    //             for (let i = 0; i < fields.length; i++) {
    //                 result[fields[i]] = obj[fields[i]];

    //             }

    //             return result;
    //         })
    //     );

    const stream$ = objAddressStream
        .pipe(
            switchMap(data => pairs(data)),
            withLatestFrom(fieldsStream.pipe(reduce((acc, elem) => { acc.push(elem); return acc; }, []))),
            filter(data => {
                const [obj, fields] = data;
                return fields.includes(obj[0]);
            }),
            map(data => data[0]),
            reduce((acc, elem) => {
                acc[elem[0]] = elem[1];
                return acc;
            }, {})
        );


    //run(stream$);
})();

// Task 11. EMPTY
// Реализуйте функцию, которая создает Observable.
// Оъявите пустой поток, который завершится через 2с, используйте оператор delay
// Верните из функции поток, который будет выдавать значения массива items, через каждые 2с.
// Используейте EMPTY, delay, from, concatMap, concat
(function task11() {
    const items = [1, 2, 3, 4, 5];

    const EMPTY$ = EMPTY.pipe(delay(2000));
    const stream$ = from(items)
        .pipe(
            concatMap(e => concat(of(e), EMPTY$))
        );

    //run(stream$);
})();


// Task 12. NEVER
// Реализуйте функцию, которая создает бесконечный Observable из массива значений
// Используейте NEVER, concat, from
(function task11() {
    const items = [1, 2, 3, 4, 5];

    const stream$ = concat(from(items), NEVER);

    //run(stream$);
})();

// Task 12. throwError()
// Реализуйте функцию, которая создаст Observable, который завершиться с ошибкой, если в массиве встретится число 3.
// Используейте from, switchMap, of, throwError
(function task11() {
    const items = [1, 2, 3, 4, 5];

    const stream$ = from(items)
        .pipe(
            switchMap(item => {
                if (item === 3) {
                    return throwError("item = 3");
                }

                return of(item);
            })
        );

    //run(stream$);
})();

// Task 14. bindCallback()
// Пусть есть некоторая функция doAsyncJob, которая выполняет асинхронную операцию и вызывает колбек, 
// когда эта операция завершается.
// Используя bindCallback, создайте функцию reactiveDoAsyncJob, вызовов которой создаст поток с передаваемым ей значением.
(function task14() {
    function doAsyncJob(data: any, callback: (data: any) => void) {
        // imitation of some request 
        setTimeout(() => {
            callback(data)
        }, 3000);
    }

    const reactiveDoAsyncJob = bindCallback(doAsyncJob);

    const stream$ = reactiveDoAsyncJob({ name: 'Anna' });

    //run(stream$);
})();

// Task 15. bindNodeCallback()
// Пусть есть некоторая функция doAsyncJob, которая выполняет асинхронную операцию и вызывает колбек в "формате ноды", 
// когда эта операция завершается.
// Используя bindNodeCallback, создайте функцию reactiveDoAsyncJob, вызовов которой создаст поток,
// который завершится ошибкой.
(function task15() {
    function doAsyncJob(data: any, callback: (error: any, data: any) => void) {
        // imitation of some request 
        setTimeout(() => {
            callback('Error', data) // callback(null, data)
        }, 3000);
    }

    const reactiveDoAsyncJob = bindNodeCallback(doAsyncJob);

    const stream$ = reactiveDoAsyncJob({ name: 'Anna' });

    //run(stream$);
})();

// Task 16. defer()
// Пусть есть некоторая функция getUsers(), которая возвращает коллекцию пользователей с помощью fetch()
// Создать Observable, в котром запуск функции getUser() произойдет в момент подписки на поток
// Используйте defer, switchMap
(function task16() {
    function getUsers(): Promise<any> {
        addItem("fetching data");
        return fetch(`http://jsonplaceholder.typicode.com/users`);
    }

    // getUsers().then(data => data.json()).then(addItem);


    const stream$ = defer(() => getUsers())
        .pipe(
            switchMap(data => data.json())
        )

    //addItem("I don't want that request now");
    //run(stream$);
})();



// Task 17. generate()
// Реализуйте функцию, которая создает Observable, который будет выдавать в поток значения, 
// хранящихся в свойстве sequence класса С
(function task17() {
    class C<T> {
        private sequence: T[] = [];

        get size(): number {
            return this.sequence.length;
        }

        add(elem: T) {
            this.sequence.push(elem);
            return this;
        }

        get(index: number): T {
            return this.sequence[index];
        }
    }

    const sequence = new C<number>().add(1).add(10).add(1000).add(10000);

    const stream$ = generate(
        0,
        i => sequence.size > i,
        i => i + 1,
        i => sequence.get(i)
    );

    //run(stream$);
})();



// Custom task 1. iif()
// Реализуйте функцию, которая создаст Observable, который выдаёт значения каждую секунду
// и говорит чётная или нечётная текущая секунда.
// Используейте interval, concatMap, iif, of
(function customTask1() {

    const stream$ = interval(1000)
        .pipe(
            concatMap(() => {
                const seconds = new Date().getSeconds();
                return iif(
                    () => seconds % 2 === 0,
                    of(seconds + " чётная"),
                    of(seconds + " нечётная")
                )
            })
        );

    //run(stream$);
})();

// Custom task 2. fromEvent()
// Реализуйте функцию, которая создаст Observable, который выдаёт значения пар нажатых клавиш (r + t)
// и если вторая клашива не была нажата в течении секунды, то забывает первую и начинает ждать сначала
// Используейте fromEvent, map, bufferTime, filter
(function customTask2() {

    const stream$ = fromEvent(document, "keydown")
        .pipe(
            map((e: KeyboardEvent) => e.key),
            bufferTime(1000),
            filter(r => r.length === 2)
        )

    //run(stream$);
})();

// Custom task 2. fromEvent()
// Реализуйте функцию, которая создаст Observable, который получается данные, группирует их по userId
// и агрегирует title первых 2х todo пользователя в одно предложение.
// Используейте ajax('https://jsonplaceholder.typicode.com/todos'), filter, switchMap, groupBy, mergeMap, take, reduce
(function customTask3() {

    const stream$ = ajax('https://jsonplaceholder.typicode.com/todos')
        .pipe(
            filter((response: AjaxResponse) => response.status === 200),
            switchMap((response: AjaxResponse) => from(response.response)),
            groupBy((u: any) => u.userId),
            mergeMap((group$) => group$
                .pipe(
                    take(2),
                    reduce((acc, cur) => acc + " " + cur.title, "")
                )
            ),
        );

    //run(stream$);
})();



export function runner() { }