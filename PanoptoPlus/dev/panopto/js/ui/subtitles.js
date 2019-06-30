/**
 * @file Subtitles, includes code that will load the transcript, then inject the subtitles as cues into the first video's texttrack.
 * If there is a second video, then when the cue is reached, the subtitle will be injected into the second video.
 * This is to circumvent the issue of the variable offset between the 1st and 2nd video currentTime.
 */
let Subtitles = (() => {
    /**
     * Subtitles, includes code that will load the transcript, then inject the subtitles as cues into the first video's texttrack.
     * If there is a second video, then when the cue is reached, the subtitle will be injected into the second video.
     * This is to circumvent the issue of the variable offset between the 1st and 2nd video currentTime.
     */
    class Subtitles {
        /**
         * Constructor is empty
         */
        constructor() {}

        /**
         * Init: initialize subtitles
         * @returns {undefined}
         */
        init() {
            //Add subtitles
            /**
             * At this point, a few issues may occur:
             * 1. Only one video DOM exists (when there are actually 2)
             * 2. The video DOM(s) do not have their src ready i.e. anything you do to the video may be undone
             * 3. The video may actually be playing (super unlikely though)
             */
            VideosLoadedEvent.subscribe(() => { this.loadSubtitles(); });
        }

        /**
         * Load videos with subtitle tracks and show subtitles.
         * @returns {undefined}
         */
        async loadSubtitles() {
            let transcript = await TranscriptRequester.get(new TranscriptSourcePanopto());
            let cueArray = transcript.toVTTCueArray();
            console.log(cueArray.length + " Subtitle cues detected");
            //Stop if there are no cues in the first place
            if (cueArray.length == 0 && Settings.getSubtitlesEnabled) {
                $("#sidebar-tab-pg-2").html("No transcript & subtitles available for this webcast.");
                //alert("No subtitles available for this webcast.");
                return;
            }
            let elements = VideosLoadedEvent.getVideosElements();
            //Add track(s) for video(s)
            let tracks = [];
            for (var i = 0; i < elements.all.length; i++) {
                tracks.push(elements.all[i].addTextTrack("captions", "English", "en"));
            }
            //Add cues only for main video
            for (let j = 0; j < cueArray.length; j++) {
                tracks[elements.primaryVideoIndex].addCue(cueArray[j]);
            }
            //If 2 videos, sync by adding cue to currentTime when the cue is played.
            if (elements.all.length === 2) {
                let currentCue = null;
                let otherVideoIndex = elements.primaryVideoIndex ^ 1;
                tracks[elements.primaryVideoIndex].oncuechange = function () {
                    //function is embedded in the code here because of the need to access previous variables for performance reasons
                    let cues = tracks[elements.primaryVideoIndex].activeCues;
                    //console.log(cues);
                    //TODO: REMOVE IF LENGTH 0
                    if (cues.length > 0) {
                        //Entered into a new cue
                        //Implementation 1: Insert with fixed death time
                        /*
                        if (tracks[otherVideoIndex].cues.getCueById(cues[0].startTime) === null) {
                            //Add cue with offset only if it hasn't already been added
                            let offset = elements.secondaryVideo.currentTime - elements.primaryVideo.currentTime;
                            let cue = new VTTCue(cues[0].startTime + offset, 
                                cues[0].endTime + offset, 
                                cues[0].text);
                            cue.id = cues[0].startTime;
                            tracks[otherVideoIndex].addCue(cue);
                        }*/
                        //Implementation 2: Insert and exit depending on other cue
                        let offset = elements.secondaryVideo.currentTime - elements.primaryVideo.currentTime;
                        currentCue = new VTTCue(cues[0].startTime + offset, 
                            cues[0].endTime + offset, 
                            cues[0].text);
                        tracks[otherVideoIndex].addCue(currentCue);
                    } else if (currentCue) {
                        tracks[otherVideoIndex].removeCue(currentCue);
                    }
                };
            } else if (videoDOMs.length > 2) {
                alert("Extension currently doesn't support subtitling of more than 2 video streams.");
            }

            //Set to show subtitles after a brief delay (Doesn't work without delay, this is a hotfix)
            let showing = true;
            do {
                showing = true;
                await sleep(500);
                //Show track(s)
                for (let i = 0; i < tracks.length; i++)
                    tracks[i].mode = "showing";
                await sleep(200);
                //verify tracks are indeed showing
                for (let i = 0; i < tracks.length; i++)
                    showing &= tracks[i].mode === "showing";
            } while(!showing);

            console.log("Subtitles loaded");
        }
    }
    return Subtitles;
})();