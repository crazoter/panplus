/**
 * The example class is a class designed to introduce how classes are defined in this project.
 * https://medium.freecodecamp.org/a-guide-to-prototype-based-class-inheritance-in-javascript-84953db26df0
 */
function ExampleClass(constructorParams) {
    //Private Object variables (can only be accessed within Example, no other class or function can access these)
    var privateVar = 1;

    //Private Object functions
    var privateFunction = function(params) {}

    //Constructor
    this.constructorParams = constructorParams;

    //Public Object variables 
    this.publicVar = 1;

    //Public Object functions
    this.publicFunction = function(params) {}
}

/**
 * Below we will define the (public) static variables & functions of the Example class.
 * To access them, you can call them anywhere in the program.
 * Note that this is possible only because Example is defined above as a function.
 * In JS, functions are also objects, and objects can have references to other objects (which can be variables or functions).
 * Remember that JS uses "var"s. A variable can be of any type and replaced with any type thereafter.
 */

//Public Static variables
ExampleClass.exampleVariable = 1;

//Public Static functions
ExampleClass.exampleFunction = function(params) {}