/**
 * Example ES6 Class
 * https://stackoverflow.com/questions/22156326/private-properties-in-javascript-es6-classes
 */
let ES6Class = (function () {
    //Private instance variable weakmap
    let privateProps = new WeakMap();
  
    //Private function (can be static or instance depending on how it is called)
    //instance: privateFunction.call(this, params);
    //static: privateFunction(params);
    function privateFunction (prefix) {
        return prefix + this.name;
    }

    class ES6Class {
        constructor(name) {
            //public instance variables
            this.name = name;
            //private instance variables
            privateProps.set(this, {age: 20});
        }

        //public instance function
        greet() {
            // Here we can access both name and age
            console.log(`name: ${this.name}, age: ${privateProps.get(this).age}`);
            
            // Calling the private instance function
            console.log(`${privateFunction.call(this, 'Mr.')}`);
        }

        className() {
            return "ES6Class";
        }

        //public static functions
        static getStaticVariable() { return this.staticVariable; }
        static getPrivateStaticVariable() { return privateStaticVariable; }
    }

    //public static variables
    ES6Class.staticVariable = 0;

    //private static variables
    let privateStaticVariable = 2;
  
    return ES6Class;
})();