/**
 * @file Panopto's viewer implementation adds periodic delays (presumably between TS files) which greatly negatively affects the implementation.. This hack fixes that.
 */
DelayDisabler = (() => {
    /**
     * Panopto's viewer implementation adds periodic delays (presumably between TS files) which greatly negatively affects the implementation.. This hack fixes that.
     */
    class DelayDisabler {
        /**
         * Initialize with regards to settings
         * @param {Object} settings Settings object
         */
        constructor(settings) {
            this.init();
        }
        /**
         * Initialize and inject function onto page context
         * @return {undefined}
         */
        init() {
            VideosLoadedEvent.subscribe(() => {
                let injectedFunc = () => {
                    
                    let firedToggle = false;
                    //I hate this method, but it's our hack in the bag
                    //Temporarily disable delay on click (play btn or video) or on spacebar
                    let tmpDisable = () => {
                        console.log("Tmp disable");
                        firedToggle = true;
                        window.setTimeout(() => {
                            firedToggle = false;
                            //If paused
                            if ($("#playButton.paused").length == 1) {
                                //Pause all players; this resolves the issue but doesn't seem to resolve the root cause
                                for (let i = 0; i <= 1; i++) {
                                    let tmp = flowplayer(i);
                                    if (tmp && tmp.playing)
                                        tmp.pause();
                                }
                            }
                        }, 10);
                    }
                    $(document).keypress((e) => {
                        if (e.which === 32) {
                            tmpDisable();
                        }
                    });
                    $("#playButton").click((e) => { tmpDisable(); });
                    $(".fp-ui").click((e) => { tmpDisable(); });
                    
                    let videoDOMs = undefined;
                    let repeatableFunction = () => {
                        //If supposed to be playing but video is paused
                        if (!firedToggle 
                            && $("#playButton.paused").length == 0
                            && Panopto.Viewer.Viewer.playState() === 1 
                            && videoDOMs.some((video) => video.paused)) {
                            firedToggle = true;
                            videoDOMs.forEach((video) => {
                                if (video) { video.play(); }
                            });
                            Panopto.Viewer.Viewer.setPlayState(1);
                            console.log("Delay quickfix triggered");
                            window.setTimeout(function() {
                                firedToggle = false;
                                repeatableFunction();
                            }, 10);
                        }
                    };

                    Panopto.Core.Logger.log = ((msg) => {
                        console.log("Logger.log", msg);
                        //Secondary player started playing stream null: Stream stopped
                        if (msg.indexOf("player changed play state to {1}") > -1 || msg.indexOf("player changed play state to 2") > -1) {
                            //playstate: 1: playing (or at least supposed to be), 2: paused
                            window.setTimeout(() => {
                                //Must convert to array first
                                videoDOMs = Array.from(document.getElementsByTagName("video"));
                                if (!Panopto.Viewer.Viewer.activeSecondary()) videoDOMs.pop();
                                repeatableFunction();
                            }, 1);
                        }
                    });
                    console.log("Delay disabler initialized");
                };
                let ctxBridge = new ContextBridge(injectedFunc);
                ctxBridge.exec();
            });
        }
    }
    return DelayDisabler;
})();