"use strict";
var Id;
(function (Id) {
    Id[Id["one"] = 0] = "one";
    Id[Id["two"] = 1] = "two";
    Id[Id["three"] = 2] = "three";
})(Id || (Id = {}));
const num = 2;
if (Id.three === num) {
    console.log("hello");
}
console.log("112");
