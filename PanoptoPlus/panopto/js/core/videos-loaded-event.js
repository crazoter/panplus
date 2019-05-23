/**
 * Promise/Callback for code that need the videos to be loaded before execution
 */
let VideosLoadedEvent = (() => {
    //private static variables
    let isWaiting = false;
    let isDone = false;
    let callbacks = $.Callbacks();

    /**
     * Private static function. Wait for video to load. This is detected by the change in src.
     * @param {DOM} videoDOM DOM of 1 video element
     */
    function waitForVideoLoad(videoDOM) {
        var observer = new MutationObserver(function() {
            //Verify all videos have been loaded
            var videoDOMs = document.querySelectorAll("video");
            var unloadedIndex = -1;
            for (var i = 0; i < videoDOMs.length; i++) {
                if (videoDOMs[i].src == "") {
                    unloadedIndex = i;
                    break;
                }
            }
            observer.disconnect();

            if (unloadedIndex === -1) {//All videos loaded
                isDone = true;
                callbacks.fire();
                callbacks.empty();
            } else {//try again but this time tracking unloaded video
                waitForVideoLoad(videoDOMs[unloadedIndex]);
            }
        });
        observer.observe(videoDOM, { attributes: true });
    };

    class VideosLoadedEvent {
        static subscribe(resolve) {
            if (!isWaiting) {
                isWaiting = true;
                var videoDOMs = document.querySelectorAll("video");
                waitForVideoLoad.call(this, videoDOMs[0]);
            }
            if (!isDone) callbacks.add(function() { resolve(); });
            else resolve();
        }
    }

    return VideosLoadedEvent;
})();