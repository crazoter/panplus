function Subtitles() {
    /**
     * Init: initialize subtitles
     */
    this.init = function() {
        //Add subtitles
        /**
         * At this point, a few issues may occur:
         * 1. Only one video DOM exists (when there are actually 2)
         * 2. The video DOM(s) do not have their src ready i.e. anything you do to the video may be undone
         * 3. The video may actually be playing (super unlikely though)
         */
        VideosLoadedEvent.subscribe(() => { loadSubtitles(); });
    };

    /**
     * Load videos with subtitle tracks and show subtitles.
     */
    var loadSubtitles = async function() {
        let transcript = await TranscriptRequester.get(new TranscriptSourcePanopto());
        let cueArray = transcript.toVTTCueArray();
        console.log(cueArray.length + " Subtitle cues detected");
        //Stop if there are no cues in the first place
        if (cueArray.length == 0 && Settings.getSubtitlesEnabled) {
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
            let otherVideoIndex = elements.primaryVideoIndex ^ 1;
            tracks[elements.primaryVideoIndex].oncuechange = function () {
                //function is embedded in the code here because of the need to access previous variables for performance reasons
                let cues = tracks[elements.primaryVideoIndex].activeCues;
                //console.log(cues);
                if (cues.length > 0) {
                    //Entered into a new cue
                    if (tracks[otherVideoIndex].cues.getCueById(cues[0].startTime) === null) {
                        //Add cue with offset only if it hasn't already been added
                        let offset = elements.secondaryVideo.currentTime - elements.primaryVideo.currentTime;
                        let cue = new VTTCue(cues[0].startTime + offset, 
                            cues[0].endTime + offset, 
                            cues[0].text);
                        cue.id = cues[0].startTime;
                        tracks[otherVideoIndex].addCue(cue);
                    }
                }
            };
        } else if (videoDOMs.length > 2) {
            alert("Extension currently doesn't support subtitling of more than 2 video streams.");
        }

        //Set to show subtitles after a brief delay (Doesn't work without delay, this is a hotfix)
        await sleep(500);

        //Show track(s)
        for (let i = 0; i < tracks.length; i++)
            tracks[i].mode = "showing";

        console.log("Subtitles loaded");
    };
}