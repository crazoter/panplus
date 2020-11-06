/**
 * Example subclass designed to show how to extend other classes
 */
function ExampleSubClass(constructorParams) {
    //This is equivalent to "super()"
    ExampleClass.call(this, constructorParams);
    //Note that private variables and private functions are NOT inherited unless added manually.
}

//Likewise, public static variables have to be manually added in if you want to inherit them.
ExampleSubClass.exampleVariable = ExampleClass.exampleVariable;
ExampleSubClass.exampleFunction = ExampleClass.exampleFunction;