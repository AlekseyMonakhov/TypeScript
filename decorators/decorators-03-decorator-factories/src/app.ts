function Logger(logString: string) {
  return function(constructor: Function) {
    console.log(logString);
    console.log(constructor);
  };
}
function Logger3(name:Person) {
  console.log(name, "logger3")
}
function Logger2(name:Person) {
  console.log(name, "this is name")
}
@Logger3
@Logger2
@Logger('LOGGING - PERSON')
class Person {
  name = 'Max';

  constructor() {
    console.log('Creating person object...');
  }
}

const pers = new Person();

console.log(pers);
