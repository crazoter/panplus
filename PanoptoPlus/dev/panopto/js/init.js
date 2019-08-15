/**
 * @file This is basically main(...){}
 * @global
 */
(() => {
    App = {};
    //return;
    //Wait for page load
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(function(mutations, observer) {
        //Check if DOM has been loaded
        if (mutations.length > 200 
            || (document.querySelector('header[role="banner"]') !== null && document.querySelector('header[role="banner"]').children[0].style.display !== "none")) {
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
                        //loggerDisabler: new LoggerDisabler(settings),//disabled
                        delayDisabler: new DelayDisabler(settings)
                    };

                    //Initialize initial settings
                    console.log("FIN");
                    $.notify("If there is an issue with silence trimming, please disable / configure in the settings tab.",{className: "info", position: "bottom right"});

                    //Show notify for new users
                    Cache.load(Cache.FIRST_TIME_KEY).then((result) => {
                        if (!result) {
                            sleep(1500).then(() => {
                                $.notify("It appears this is your first time using this Chrome extension!",{className: "success", position: "bottom right", autoHideDelay: 10000});
                            }).then(sleep(3000).then(() => {
                                $.notify("You might want to access the settings tab on the right to customize your user interface.",{className: "success", position: "bottom right", autoHideDelay: 10000});
                                sleep(1500).then(() => {$.notify("You can change tabs here.",{className: "success", position: "top left", autoHideDelay: 10000})});
                            }));
                            Cache.save(Cache.FIRST_TIME_KEY, true, 99999);
                        }
                    })
                });
            });
        }
    });
    observer.observe(document, {subtree: true, attributes: true});
})();