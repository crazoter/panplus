/**
 * @file Random helper functions. These functions will have global scope within the Chrome Extension. 
 * Remember that all code are executed within this chrome extension environment and does not extend to the webpage.
 * To inject code directly onto the user's page, you will need to use context-bridge.js.
 */

/**
 * jQuery helper function to get querystring parameter
 * @param {String} url url to retrieve querystring from
 * @param {String} name name of querystring parameter
 * @returns {String} the querystring params
 */
$.urlParam = function (url, name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
    return (results !== null) ? results[1] || 0 : false;
}

/**
 * Helper function to help implementation of interfaces (refer to examples/example-interface.js)
 * @param {String} interfaceName interface name
 */
function resolvePrecept(interfaceName) {
    var interfaceName = interfaceName;
    return function unimplementedInterfaceError(value) {
        throw new Error(interfaceName +  ' ' + value +  ' requires an implementation.');
    };
}

/**
 * Helper function to convert uint8Array to array buffer
 * https://stackoverflow.com/questions/37228285/uint8array-to-array-buffer
 * @param {Uint8Array} array array of data
 * @returns {ArrayBuffer}
 */
function Uint8ArrayToArrayBuffer(array) {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
}

/**
 * Sleep for ms milliseconds
 * @param {Number} ms time in ms
 * @returns {Promise} Promise that resolves after timeout
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}