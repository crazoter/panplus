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
                        // loggerDisabler: new LoggerDisabler(settings),
                        sidebar: new Sidebar(settings),
                        speedSlider: new SpeedSlider(settings),
                        transcriptDisplay: new TranscriptDisplay(settings),
                        silenceCueManager: new SilenceCueManager(settings),
                        tsTracker: new TSTracker(settings),
                        carouselManager: new CarouselManager(settings),
                        delayDisabler: new DelayDisabler(settings),
                        videoAudioContextManager: new VideoAudioContextManager(settings),
                        //volumeBooster: new VolumeBooster(settings),//Moved into VideoAudioContextManager
                        //whiteNoiseReducer: new WhiteNoiseReducer(settings),//Moved into VideoAudioContextManager
                    };

                    //Initialize initial settings
                    console.log("FIN");

                    //Todo: Abstract this to another class
                    const UPDATE_MESSAGE = "Update: Resolved issue preventing silence trimming.";
                    //Show notify for new users, or update prompt
                    Cache.load(Cache.FIRST_TIME_KEY).then((result) => {
                        if (!result) {
                            sleep(1500).then(() => {
                                $.notify("It appears this is your first time using this Chrome extension!",{className: "success", position: "bottom right", autoHideDelay: 15000});
                            }).then(sleep(3000).then(() => {
                                $.notify("You might want to access the settings tab on the right to customize your user interface.",{className: "success", position: "bottom right", autoHideDelay: 15000});
                                sleep(1500).then(() => {$.notify("You can change tabs here.",{className: "success", position: "top left", autoHideDelay: 15000})});
                            }));
                            Cache.save(Cache.FIRST_TIME_KEY, true, 99999);
                        } else {
                            Cache.load(Cache.UPDATE_MESSAGE).then((result) => {
                                if (!result || UPDATE_MESSAGE !== result) {
                                    $.notify(UPDATE_MESSAGE,{className: "info", position: "top right", autoHide: false, clickToHide: true});
                                    Cache.save(Cache.UPDATE_MESSAGE, UPDATE_MESSAGE, 99999);
                                }
                            })

                            $.notify("If there is an issue with silence trimming, please disable / configure in the settings tab.",{className: "info", position: "bottom right", autoHideDelay: 7000});
                        }
                    })
                });
            });
        }
    });
    observer.observe(document, {subtree: true, attributes: true});
})();