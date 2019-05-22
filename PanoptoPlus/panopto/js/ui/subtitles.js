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
    }

    /**
     * Load videos with subtitle tracks and show subtitles.
     */
    var loadSubtitles = function() {
        Transcript.get().then(transcript => {
            var videoDOMs = document.querySelectorAll("video");
            var cueArray = transcript.toVTTCueArray();
            for (var i = 0; i < videoDOMs.length; i++) {
                var cueArray = transcript.toVTTCueArray();
                console.log(cueArray.length + " Subtitle cues detected");
                if (cueArray.length == 0 && Settings.getSubtitlesEnabled) {
                    alert("No subtitles available for this webcast.");
                }
                var track = videoDOMs[i].addTextTrack("captions", "English", "en");
                for (var j = 0; j < cueArray.length; j++) {
                    track.addCue(cueArray[j]);
                }
                //Set to show subtitles after a brief delay (Doesn't work without delay, this is a hotfix)
                window.setTimeout(function() { 
                    var videoDOMs = document.querySelectorAll("video");
                    for (var i = 0; i < videoDOMs.length; i++) {
                        videoDOMs[i].textTracks[videoDOMs[i].textTracks.length - 1].mode = "showing";
                    }
                    console.log("Subtitles loaded");
                },500);
            }
        });
    };
}