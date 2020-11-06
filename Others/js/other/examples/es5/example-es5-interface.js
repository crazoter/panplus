/**
 * Example interface
 */
function ExampleInterface() {
    //This resolvePrecept function is in core/helper.js
    var throwError = resolvePrecept('ExampleInterface');

    //Public variables that must be included in the implementation
    this.datum1 = this.datum1 || throwError('datum1');
    this.datum2 = this.datum2 || throwError('datum2');

    //Public functions that must be included in the implementation
    this.method1 = this.method1 || throwError('method1');
    this.method2 = this.method2 || throwError('method2');
};