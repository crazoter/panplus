/**
 * Example ES6 Class
 * https://stackoverflow.com/questions/22156326/private-properties-in-javascript-es6-classes
 */
let ES6Subclass = (function () {
    //Private instance variables and functions are extended
    //Public instance variables and functions are extended
    //Public static variables and functions are extended
    class ES6Subclass extends ES6Class {
        constructor(name) {
            super(name);
        }

        className() {
            return "ES6Subclass";
        }
    }
    return ES6Subclass;
})();