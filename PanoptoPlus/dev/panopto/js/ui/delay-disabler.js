/**
 * @file Panopto's viewer implementation adds periodic delays (presumably between TS files) which greatly negatively affects the implementation.. This hack fixes that.
 */
DelayDisabler = (() => {
    /**
     * Panopto's viewer implementation adds periodic delays (presumably between TS files) which greatly negatively affects the implementation.. This hack fixes that.
     */
    class DelayDisabler {
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
            let injectedFunc = () => {
                let firedToggle = false;
                //I hate this method, but it's our hack in the bag
                let videoDOMs = Array.from(document.getElementsByTagName("video"));
                let repeatableFunction = () => {
                    if (!firedToggle && Panopto.Viewer.Viewer.playState() === 1 && videoDOMs.some((video) => video.paused)) {
                        //Supposed to be playing but video is paused?!
                        //lol...
                        firedToggle = true;
                        videoDOMs.forEach((video) => {
                            video.play();
                        });
                        Panopto.Viewer.Viewer.setPlayState(1);
                        console.info("Delay quickfix triggered");
                        window.setTimeout(function() {
                            firedToggle = false;
                            repeatableFunction();
                        }, 10);
                    }
                };
                Panopto.Core.Logger.log = ((msg) => {
                    console.info(msg);
                    if (msg.indexOf("player changed play state to {1}") > -1 || msg.indexOf("player changed play state to 2") > -1) {
                        //playstate: 1: playing (or at least supposed to be), 2: paused
                        repeatableFunction();
                    }
                });
                console.info("Delay disabler initialized");
            };
            let ctxBridge = new ContextBridge(injectedFunc);
            ctxBridge.exec();
        }
    }
    return DelayDisabler;
})();