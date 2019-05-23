/**
 * ContextBridge class for setting up linkages between the isolated code environment and the actual code environment of the user
 * @param {function} func the function to be injected into the page.
 * @param {string} eventHandle the string used for triggering & detecting events for this particular bridge
 * @param {function} eventHandler the function called whenever the eventHandle is triggered. This function takes in 1 parameter.
 */
let ContextBridge = (function() {
  
    /**
     * private function to inject script into webpage
     * @param {string} code code to be injected in string format
     */
    function injectScript(code) {
        this.script = document.createElement('script');
        this.script.textContent = code;
        document.body.appendChild(this.script);
    }
    /**
     * private function to create script for bridge
     */
    function buildConnectScript() {
        return `(() => { var bridgeCall = ${this.func}
        ; var bridgeCallback = function (detail) {
        document.dispatchEvent(new CustomEvent("${this.eventHandle}", {detail: detail})); };
        bridgeCall(); })();`;
    }
    class ContextBridge {
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
         * Untested & Unused Code
         */
        exec() {
            injectScript.call(this, `(${func})();`);
            this.script.remove();
            this.script = null;
        }

        /**
         * Execute the function but instead of returning a Promise, uses the eventHandler callback function instead
         * Use to build a persistent bridge.
         */
        connect() {
            injectScript.call(this, buildConnectScript.call(this));
            document.addEventListener(this.eventHandle, this.eventHandler);
            this.script.remove();
            this.script = null;
        }

        /**
         * Clean-up, remove scripts and event listeners
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