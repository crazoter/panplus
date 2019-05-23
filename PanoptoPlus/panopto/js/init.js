//This is basically main(...){}
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
                new Sidebar().init();
                new SpeedSlider().init();
                new Subtitles().init();
                new TSTracker().init();
                console.log("FIN");
            });
        }
    });
    observer.observe(document, {subtree: true,attributes: true});
})();