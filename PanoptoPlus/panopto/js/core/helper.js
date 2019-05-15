/**
 * Random helper functions. These functions will have global scope within the Chrome Extension. 
 * Remember that all code are executed within this chrome extension environment and does not extend to the webpage.
 * To inject code directly onto the user's page, you will need to use context-bridge.js.
 */

/**
 * jQuery helper function to get querystring parameter
 * @param {string} name name of querystring parameter
 */
$.urlParam = function (url, name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
    return (results !== null) ? results[1] || 0 : false;
}

/**
 * Helper function to help implementation of interfaces (refer to examples/example-interface.js)
 */
resolvePrecept = function(interfaceName) {
    var interfaceName = interfaceName;
    return function unimplementedInterfaceError(value) {
        throw new Error(interfaceName +  ' ' + value +  ' requires an implementation.');
    };
}