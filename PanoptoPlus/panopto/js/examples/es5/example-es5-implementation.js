/**
 * Example implementation of example interface
 */
function ExampleImplementation() {
    //Add your public variables and public functions
    this.datum1 = 1;
    this.datum2 = 'str';

    this.method1 = function(){}
    this.method2 = function(){}

    //Apply Interface (Implement interface)
    ExampleInterface.apply(this);
};