/**
 * Promise/Callback for code that need the videos to be loaded before execution
 */
function VideosLoadedEvent() {}
(function() {
    var isWaiting = false;
    var isDone = false;
    var callbacks = $.Callbacks();
    VideosLoadedEvent.subscribe = function(resolve) {
        if (!isWaiting) {
            var videoDOMs = document.querySelectorAll("video");
            waitForVideoLoad(videoDOMs[0]);
            isWaiting = true;
        }
        if (!isDone) callbacks.add(function() { resolve(); });
        else resolve();
    }

    /**
     * Wait for video to load. This is detected by the change in src.
     * @param {DOM} videoDOM DOM of 1 video element
     */
    var waitForVideoLoad = function(videoDOM) {
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
})();