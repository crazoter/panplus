/**
 * @file This is basically main(...){}
 * @global
 */
(() => {
    //Wait for page load
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(function(mutations, observer) {
        //Check if DOM has been loaded
        if (mutations.length > 200 || document.querySelector('header[role="banner"]') !== null) {
            observer.disconnect();
            //Put initialization code here
            console.log("DOM loaded!");
            Settings.initialize().then((instance) => {
                new Sidebar().init();
                new SpeedSlider().init();
                new Subtitles().init();
                new SilenceCueManager().init();
                new TSTracker().init();
                new LoggerDisabler().init();
                new DelayDisabler().init();
                console.log("FIN");
            });
        }
    });
    observer.observe(document, {subtree: true, attributes: true});
})();