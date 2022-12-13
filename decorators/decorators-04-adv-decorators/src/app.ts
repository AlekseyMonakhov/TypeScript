function Logger(logString: string) {
  return function(constructor: Function) {
    console.log(logString);
    console.log(constructor);
  };
}

function WithTemplate(template: string, hookId: string) {
  return function(constructor: any) {
    const hookEl = <HTMLDivElement>document.getElementById(hookId);
    const p = new constructor();
    if (hookEl) {
      hookEl.innerHTML = template;
      hookEl.querySelector('h2')!.textContent = p.name;
    }
  }
}

// @Logger('LOGGING - PERSON')
@WithTemplate('<div><h1>My Person Object</h1><h2>test</h2></div>', 'app')
class Person {
  name = 'Max';

  constructor() {
    console.log('Creating person object...');
  }
}

const pers = new Person();

console.log(pers);

function test() {
  return function(lastName:string) {
    console.log(lastName);
    
  } 
}
test()("leo")