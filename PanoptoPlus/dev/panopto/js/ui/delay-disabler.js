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
                Panopto.Core.Logger.log = ((msg) => {
                    if (msg.indexOf("player changed play state to {1}") > -1) {
                        //playstate: 1: playing (or at least supposed to be), 2: paused
                        if (!firedToggle && Panopto.Viewer.Viewer.playState() === 1 && videoDOMs.some((video) => video.paused)) {
                            firedToggle = true;
                            //Supposed to be playing but video is paused?!
                            //lol...
                            //console.info("TRIGGERED");
                            window.setTimeout(function(){
                                Panopto.Viewer.Viewer.togglePlaying();
                                Panopto.Viewer.Viewer.togglePlaying();
                                firedToggle = false;
                            }, 10);
                        }
                    }
                });
            };
            let ctxBridge = new ContextBridge(injectedFunc);
            ctxBridge.exec();
        }
    }
    return DelayDisabler;
})();