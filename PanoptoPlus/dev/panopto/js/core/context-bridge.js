/**
 * @file Content scripts live in an isolated world, allowing a content script to makes changes to its JavaScript environment without conflicting with the page or additional content scripts. 
 * This class is designed to help facilitate communication between the two "worlds".
 * https://developer.chrome.com/extensions/content_scripts
 */
let ContextBridge = (() => {
    /**
     * private function to inject script into webpage
     * @private
     * @static
     * @param {string} code code to be injected in string format
     * @returns {undefined}
     */
    function injectScript(code) {
        this.script = document.createElement('script');
        this.script.textContent = code;
        document.body.appendChild(this.script);
    }
    /**
     * private function to wrap function with additional code to be injected
     * @private
     * @static
     * @returns {undefined}
     */
    function buildConnectScript() {
        return `(() => { var bridgeCall = ${this.func}
        ; var bridgeCallback = function (detail) {
        document.dispatchEvent(new CustomEvent("${this.eventHandle}", {detail: detail})); };
        bridgeCall(); })();`;
    }
    /**
     * ContextBridge class for setting up linkages between the isolated code environment and the actual code environment of the user.
     * Use by first creating this class with a function (that you want to call in the actual code environment). Remember that code in this function will not
     * be able to access any variables or functions in the isolated code environment. Then, call request, exec or connect as required.
     */
    class ContextBridge {
        /**
         * ContextBridge class for setting up linkages between the isolated code environment and the actual code environment of the user
         * @param {function} func the function to be injected into the page. To trigger the eventHandle (and eventHandler) from within this function, call bridgeCallback().
         * @param {String|undefined} eventHandle the string used for triggering & detecting events for this particular bridge. Only required if using request or connect.
         * @param {function|undefined} eventHandler the function called whenever the eventHandle is triggered (think of it as a callback). This function takes in 1 parameter. Only required if using connect.
         */
        constructor(func, eventHandle, eventHandler) {
            //public object variables
            this.func = func;
            this.eventHandle = eventHandle;
            this.eventHandler = eventHandler;
            this.script = null;
        }

        /**
         * Execute the function, and then return the data stored in the "connectData" variable to the context script
         * This function itself returns a promise which returns the data.
         * Use for a one time request & response.
         * @returns {Promise} Promise with resolve of 1 parameter of Object (depending on what was requested)
         */
        request() {
            injectScript.call(this, buildConnectScript.call(this));
            this.script.remove();
            this.script = null;
            return new Promise((resolve) => {
                document.addEventListener(this.eventHandle, (e) => {
                    this.close();
                    return resolve(e.detail);
                });
            });
        }

        /**
         * Execute is a fire-and-forget event without the use of the event handler
         * @returns {undefined}
         */
        exec() {
            injectScript.call(this, `(${this.func})();`);
            this.script.remove();
            this.script = null;
        }

        /**
         * Execute the function but instead of returning a Promise, uses the eventHandler callback function instead.
         * Use to build a persistent bridge.
         * @returns {undefined}
         */
        connect() {
            injectScript.call(this, buildConnectScript.call(this));
            document.addEventListener(this.eventHandle, this.eventHandler);
            this.script.remove();
            this.script = null;
        }

        /**
         * Clean-up, remove scripts and event listeners. This is automatically handled if you used request or exec. 
         * However, if you used connect (which establishes a connection), then you may want to call close() to terminate the connection.
         * @returns {undefined}
         */
        close() {
            if (this.script != null) {
                this.script.remove();
            }
            if (this.eventHandle != null && this.eventListenerHandler != null) {
                document.removeEventListener(this.eventHandle, this.eventListenerHandler);
            }
        }
    }

    return ContextBridge;
})();