//This is the same as function init() {...} init();
(function init() {
    //Wait for page load
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(function(mutations, observer) {
        //Check if DOM has been loaded
        if (mutations.length > 200 || document.querySelector('header[role="banner"]') !== null) {
            observer.disconnect();
            //Put initialization code here
            console.log("DOM loaded!");
            Settings.initialize().then((instance) => {
                //Init UI
                var sidebar = new Sidebar();
                sidebar.init();
                var speedSlider = new SpeedSlider();
                speedSlider.init();
                var subtitles = new Subtitles();
                subtitles.init();
                //Init silence trimming
                //var silenceShortener = new SilenceShortener();
                //silenceShortener.init();

                var tsTracker = new TSTracker();
                tsTracker.init();

                console.log("FIN");
            });
        }
    });
    observer.observe(document, {subtree: true,attributes: true});
})();