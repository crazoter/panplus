/**
 * ContextBridge class for setting up linkages between the isolated code environment and the actual code environment of the user
 * @param {function} func the function to be injected into the page.
 * @param {string} eventHandle the string used for triggering & detecting events for this particular bridge
 * @param {function} eventHandler the function called whenever the eventHandle is triggered. This function takes in 1 parameter.
 */
function ContextBridge(func, eventHandle, eventHandler) {
    //public object variables
    this.func = func;
    this.eventHandle = eventHandle;
    this.eventHandler = eventHandler;
    this.script = null;

    //private object variables
    //"this" is different across various contexts, we want to use self to ensure we're referring to this ContextBridge object
    var self = this;

    /**
     * private function to inject script into webpage
     * @param {string} code code to be injected in string format
     */
    var injectScript = function(code) {
        self.script = document.createElement('script');
        self.script.textContent = code;
        document.body.appendChild(self.script);
    }
    /**
     * private function to create script for bridge
     */
    var buildConnectScript = function() {
        var code = '(() => { var bridgeCall = ' + func +
        '; var bridgeCallback = function (detail) {' +
        'document.dispatchEvent(new CustomEvent("' + self.eventHandle + '", {detail: detail})); };' +
        'bridgeCall(); })();';
        return code;
    }

    /**
     * Execute the function, and then return the data stored in the "connectData" variable to the context script
     * This function itself returns a promise which returns the data.
     * Use for a one time request & response.
     */
    this.request = function() {
        injectScript(buildConnectScript());
        this.script.remove();
        this.script = null;
        return new Promise(function(resolve) {
            document.addEventListener(self.eventHandle, function(e) {
                self.close();
                return resolve(e.detail);
            });
        });
    }

    /**
     * Execute is a fire-and-forget event without the use of the event handler
     * Untested & Unused Code
     */
    this.exec = function() {
        var actualCode = '(' + func + ')();';
        injectScript(actualCode);
        this.script.remove();
        this.script = null;
    }

    /**
     * Execute the function but instead of returning a Promise, uses the eventHandler callback function instead
     * Use to build a persistent bridge.
     */
    this.connect = function() {
        injectScript(buildConnectScript());
        document.addEventListener(this.eventHandle, this.eventHandler);
        this.script.remove();
        this.script = null;
    }

    /**
     * Clean-up, remove scripts and event listeners
     */
    this.close = function() {
        if (this.script != null) {
            this.script.remove();
        }
        if (this.eventHandle != null && this.eventListenerHandler != null) {
            document.removeEventListener(this.eventHandle, this.eventListenerHandler);
        }
    }
}