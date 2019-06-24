/**
 * @file Disable console.log (mostly by Panopto's object) to improve performance for user.
 * Has potential to be a toggler but as per requirements now there's no need to add a toggle feature
 */
LoggerDisabler = (() => {
    /**
     * Class to inject code to disable console.log (mostly by Panopto's object) to improve performance for user. Has potential to be a toggler but as per requirements now there's no need to add a toggle feature
     */
    class LoggerDisabler {
        /**
         * Constructor is empty
         */
        constructor() {}
        /**
         * Initialize and inject function onto page context
         * @return {undefined}
         */
        init() {
            //Inject script to toggle console.log
            //https://stackoverflow.com/questions/1215392/how-to-quickly-and-conveniently-disable-all-console-log-statements-in-my-code
            let injectedFunc = () => {
                let logger = (() => {
                    let oldConsoleLog = null;
                    let pub = {};

                    pub.enableLogger =  () => {
                        if(oldConsoleLog == null)
                            return;
                        window['console']['log'] = oldConsoleLog;
                    };

                    pub.disableLogger = () => {
                        oldConsoleLog = console.log;
                        window['console']['log'] = () => {};
                    };

                    return pub;
                })();
                logger.disableLogger();
            };
            let ctxBridge = new ContextBridge(injectedFunc);
            ctxBridge.exec();
        }
    }
    return LoggerDisabler;
})();