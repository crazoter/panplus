/**
 * ContextBridge class for setting up linkages between the isolated code environment and the actual code environment of the user
 * @param {string} eventHandle the string used for triggering & detecting events for this particular bridge
 * @param {function} func the function to be executed
 */
function ContextBridge(func, eventHandle, eventHandler) {
    this.func = func;
    this.eventHandle = eventHandle;
    this.eventHandler = eventHandler;
    this.script = null;

    this.injectScript = function(actualCode) {
        this.script = document.createElement('script');
        this.script.textContent = actualCode;
        //(document.head||document.documentElement).appendChild(this.script);
        document.body.appendChild(this.script);
    }

    //Execute is a fire-and-forget event without the use of the event handler
    //Untested Code
    this.exec = function() {
        var actualCode = '(' + func + ')();';
        this.injectScript(actualCode);
        this.script.remove();
    }

    this.buildConnectScript = function() {
        var code = '(function() {var bridgeCall = ' + func + '; var bridgeCallback = function (detail) {' +
        'document.dispatchEvent(new CustomEvent("' + this.eventHandle + '", {detail: detail})); };' +
        'bridgeCall(); })();';
        return code;
    }

    //Execute the function, and then return the data stored in the "connectData" variable to the context script
    //This function itself returns a promise which returns the data.
    //Use for a one time request & response.
    this.request = function() {
        this.injectScript(this.buildConnectScript());
        this.script.remove();
        var self = this;
        return new Promise(function(resolve) {
            document.addEventListener(self.eventHandle, function(e) {
                self.close();
                return resolve(e.detail);
            });
        });
    }

    //Execute the function but instead of returning a Promise, uses the eventHandler callback function instead
    //Use to build a persistent bridge.
    //Untested Code
    this.connect = function() {
        this.injectScript(this.buildConnectScript());
        document.addEventListener(this.eventHandle, this.eventHandler);
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