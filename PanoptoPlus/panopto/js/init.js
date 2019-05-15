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
            var sidebar = new Sidebar();
            sidebar.init();
            var speedSlider = new SpeedSlider();
            speedSlider.init();
            Transcript.get().then(data => { console.log(data); });
        }
    });
    observer.observe(document, {subtree: true,attributes: true});
})();