/**
 * @file This is basically main(...){}
 * @global
 */
(() => {
    App = {};
    //Wait for page load
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(function(mutations, observer) {
        //Check if DOM has been loaded
        if (mutations.length > 200 || document.querySelector('header[role="banner"]') !== null) {
            observer.disconnect();
            //Put initialization code here
            console.log("DOM loaded!");
            //Initialize cache & settings
            Cache.init().then(() => {
                Settings.init().then(() => {
                    let settings = Settings.getDataAsObject();
                    //debugger;
                    //Initialize app
                    App = {
                        sidebar: new Sidebar(settings),
                        speedSlider: new SpeedSlider(settings),
                        volumeBooster: new VolumeBooster(settings),
                        transcriptDisplay: new TranscriptDisplay(settings),
                        silenceCueManager: new SilenceCueManager(settings),
                        tsTracker: new TSTracker(settings),
                        carouselManager: new CarouselManager(settings),
                        //loggerDisabler: new LoggerDisabler(settings),
                        delayDisabler: new DelayDisabler(settings)
                    };
                    /*
                    let keys = Object.keys(App);
                    keys.forEach((key) => { 
                        App[key].init();
                    });*/

                    //Initialize initial settings
                    console.log("FIN");
                });
            });
        }
    });
    observer.observe(document, {subtree: true, attributes: true});
})();