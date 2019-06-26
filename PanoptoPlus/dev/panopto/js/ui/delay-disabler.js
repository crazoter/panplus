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
            let injectedFunc = () => {
                let firedToggle = false;
                //I hate this method, but it's our hack in the bag
                //Temporarily disable delay on click or on spacebar
                let tmpDisable = () => {
                    console.info("Tmp disable");
                    firedToggle = true;
                    window.setTimeout(() => {firedToggle = false}, 10);
                }
                $(window).keypress((e) => {
                    if (e.which === 32) {
                        tmpDisable();
                    }
                });
                $("#playButton").click((e) => {
                    tmpDisable();
                });
                
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
                        window.setTimeout(() => {
                            repeatableFunction();
                        }, 1);
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