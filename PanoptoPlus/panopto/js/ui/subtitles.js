function Subtitles() {
    this.init = function() {
        // Playing event
        Transcript.get().then(transcript => { 
            //Add subtitles
            /**
             * At this point, a few issues may occur:
             * 1. Only one video DOM exists (when there are actually 2)
             * 2. The video DOM(s) do not have their src ready i.e. anything you do to the video may be undone
             * 3. The video may actually be playing
             */
            var videoDOMs = document.querySelectorAll("video");
            waitForVideoLoad(videoDOMs[0], transcript);
        });
    }

    var waitForVideoLoad = function(videoDOM, transcript) {
        var observer = new MutationObserver(function(mutations) {
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

            if (unloadedIndex === -1) {//If all videos loaded, proceed to load subtitles.
                var cueArray = transcript.toVTTCueArray();
                for (var i = 0; i < videoDOMs.length; i++) {
                    var cueArray = transcript.toVTTCueArray();
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
                    },500);
                }
            } else {//try again
                waitForVideoLoad(videoDOMs[unloadedIndex], transcript);
            }
        });
        observer.observe(videoDOM, { attributes: true });
    }
}