let SilenceCueManager = (() => {
    class SilenceCueManager {
        /**
         * Add Silence Cues
         * Init: initialize cached silence cues
         */
        constructor() {}

        init() {
            VideosLoadedEvent.subscribe(() => { 
                this.loadSilenceCues(); 
            });
        }

        /**
         * Load videos with cues tracks and skip as necessary.
         */
        async loadSilenceCues() {
            let elements = VideosLoadedEvent.getVideosElements();

            SilenceCueManager.cueTrack = elements.primaryVideo.addTextTrack("metadata", "silenceCues");

            //Todo: add cached cues here

            //Todo: add setting configs to influence playback rate
            SilenceCueManager.cueTrack.oncuechange = function () {
                let cues = SilenceCueManager.cueTrack.activeCues;
                //If on enter
                if (cues.length > 0) {
                    //Calculate offset and skip if necessary
                    //Note: This may cause a desync between the two videos. However, this is just speculation and hasn't been verified.
                    let offset = cues[0].endTime - cues[0].startTime;
                    if (elements.secondaryVideo != null) {
                        elements.secondaryVideo.currentTime += offset;
                    }
                    elements.primaryVideo.currentTime += offset;
                    console.log(`Jump made from ${cues[0].startTime} to ${cues[0].endTime}`);
                }
            };

            //Enable track
            await sleep(500);

            SilenceCueManager.cueTrack.mode = "hidden";
        };

        /**
         * Convert id to index
         * @param {String} id relurl of the TS file
         */
        static idToIndex(id) {
            return parseInt(id.substr(0, id.length - 3));
        }
        
        /**
         * Add silence cues based on start time & result object
         * linkages:
         * speaking -> speaking OR !speaking -> !speaking: No modification
         * speaking -> !speaking: No modification
         * !speaking -> speaking: Addition of cue, !speaking = start time, speaking = end time
         * @param {String} id relurl of the TS file
         * @param {Array} results [{isSpeaking: Boolean, time: Number}, ...]
         */
        static addSilenceCues(id, results) {
            let index = SilenceCueManager.idToIndex(id);
            //Assume is not speaking at the start 
            for (let i = 0; i < results.length; i++) {
                let tmp = null;
                if (results[i].isSpeaking) {
                    //If is speaking and first and the previous was not speaking
                    if (i === 0 
                        && (tmp = SilenceCueManager.cuesMap[index - 1]) != null
                        && tmp.length > 0
                        && !tmp[tmp.length - 1].isSpeaking) {
                        //Link with previous
                        SilenceCueManager.addSilentCue(tmp[tmp.length - 1].time, results[i].time);
                    }
                    //Else do nothing
                } else {
                    //If is not speaking and last and next is speaking
                    if (i === results.length - 1 
                        && (tmp = SilenceCueManager.cuesMap[index + 1]) != null
                        && tmp.length > 0
                        && tmp[0].isSpeaking) {
                        //Link with next
                        SilenceCueManager.addSilentCue(results[i].time, tmp[tmp.length - 1].time);
                    }
                    //Else check if can link with next
                    if (results[i + 1] != null && results[i + 1].isSpeaking) {
                        SilenceCueManager.addSilentCue(results[i].time, results[i + 1].time);
                    }
                }
            }
        }

        /**
         * Add silent cue for video to take action
         * @param {Number} startTime start of silence
         * @param {Number} endTime end of silence
         */
        static addSilentCue(startTime, endTime) {
            SilenceCueManager.cueTrack.addCue(new VTTCue(startTime, endTime, ""));
        }

        /**
         * Add results from TSTracker to cache
         * @param {String} id relurl of the TS file
         * @param {Array} results [{isSpeaking: Boolean, time: Number}, ...]
         */
        static addToCache(id, results) {
            //Save to map
            SilenceCueManager.cuesMap[SilenceCueManager.idToIndex(id)] = results;
            //Do other caching stuff
        }
    }

    //Static variables
    SilenceCueManager.cueTrack = null;
    SilenceCueManager.cuesMap = {};

    return SilenceCueManager;
})();