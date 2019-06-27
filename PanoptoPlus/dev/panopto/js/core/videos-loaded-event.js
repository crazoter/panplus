/**
 * @file Promise/Callback for code that need the videos to be loaded before execution
 */
let VideosLoadedEvent = (() => {
    //private static variables
    let isWaiting = false;
    let isDone = false;
    let videoElements = {
        all: [],
        primaryVideoIndex: undefined,
        primaryVideo: undefined,
        secondaryVideo: undefined
    };
    let callbacks = $.Callbacks();

    /**
     * Private static function. Wait for video to load. This is detected by the change in src.
     * @private
     * @static
     * @param {DOM} videoDOM DOM of 1 video element
     * @returns {undefined}
     */
    async function waitForVideoLoad() {
        //MutationObserver suddenly stopped working so I'm going to use a more primitive method lmao
        let sleepMs = 20;
        let countDone = 0;
        while ((countDone = Math.max(countDone, verifyVideoLoad(countDone))) < 2) {
            //If one video is already loaded, wait 4 times. 
            //If it doesn't load by then, then consider it loaded.
            //countDone will result in a non-integer if it is only 1 video.
            if (countDone >= 1)
                countDone += 0.30;
            await sleep(sleepMs++);
        }
        videosLoaded(countDone);
    };

    /**
     * Verify all videos have been loaded, else return video to await for.
     * @private
     * @static
     * @returns {Number} Number of video elements loaded
     */
    function verifyVideoLoad() {
        let videoDOMs = document.querySelectorAll("video");
        let count = 0;
        for (let i = 0; i < videoDOMs.length; i++) {
            if (videoDOMs[i].src !== "") {
                count++;
            }
        }
        return count;
    }

    /**
     * private static function to call when videos are loaded
     * @private
     * @static
     * @param {Number} countDone used to ID if 1 or 2 video stream
     * @returns {undefined}
     */
    function videosLoaded(countDone) {
        let videoDOMs = document.querySelectorAll("video");
        if (Math.floor(countDone) === countDone) {
            //2 video stream
            //We want to ensure that both subtitles are synced. The transcript timestamps that we got are based on the one that starts earlier.
            //Thus, get the videoDOM with the lowest currentTime.
            let mainVideoIndex = 0;
            let min = videoDOMs[0].currentTime;
            for (let i = 1; i < videoDOMs.length; i++) {
                if (videoDOMs[i].currentTime < min) {
                    mainVideoIndex = i;
                    min = videoDOMs[i].currentTime;
                }
            }
            videoElements = {
                all: videoDOMs,
                primaryVideoIndex: mainVideoIndex,
                primaryVideo: videoDOMs[mainVideoIndex],
                secondaryVideo: videoDOMs[mainVideoIndex^1]
            };
        } else {
            //1 video stream
            let video = $(".fp-engine.hlsjs-engine")[0];
            videoElements = {
                all: [video],
                primaryVideoIndex: 0,
                primaryVideo: video,
                secondaryVideo: undefined
            };
        }
        isDone = true;
        callbacks.fire();
        callbacks.empty();
        console.log("Videos Loaded");
    }

    /**
     * @file Class that manages the Promise/Callback for code that need the videos to be loaded before execution
     */
    class VideosLoadedEvent {
        /**
         * Subscribe to event when videos are loaded
         * @param {Function} resolve resolve method for promise
         * @returns {undefined}
         */
        static subscribe(resolve) {
            if (!isWaiting) {
                isWaiting = true;
                waitForVideoLoad.call(this);
            }
            if (!isDone) callbacks.add(function() { resolve(); });
            else resolve();
        }

        /**
         * Return all videoDOMs, primary video and secondary video.
         * Primary video refers to the video that the subtitles (and silence cues) are synced to in terms of timestamp.
         * If there is only 1 video stream, then the secondary video is undefined.
         * @return {{all: Array.<Video>, primaryVideoIndex: Number, primaryVideo: Video, secondaryVideo: Video|undefined}}
         */
        static getVideosElements() {
            return videoElements;
        }
    }

    return VideosLoadedEvent;
})();