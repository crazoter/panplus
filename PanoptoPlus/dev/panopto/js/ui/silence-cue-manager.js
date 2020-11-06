/**
 * @file Silence Cue Manager uses the texttrack system to keep track of when to jump in the event of silence, and subsequently handles the jump.
 */
let SilenceCueManager = (() => {
    /**
     * Silence Cue Manager uses the texttrack system to keep track of when to jump in the event of silence, and subsequently handles the jump.
     */
    class SilenceCueManager {
        /**
         * Initialize with regards to settings
         * @param {Object} settings Settings object
         */
        constructor(settings) {
            if (settings[Settings.keys.silencetrimming]) {
                this.updateVisibilitySleepTime = 500;
                this.updateVisibilitySleepTimeIncrement = 100;
                this.updateVisibilitySleepTimeMax = 1000;
                this.init();
            }
        }

        /**
         * Initialize Silence Cue Manager.
         * @returns {undefined}
         */
        init() {
            VideosLoadedEvent.subscribe(() => { 
                this.loadSilenceCues(); 
            });
        }

        /**
         * Load videos with cues tracks and skip as necessary.
         * @returns {undefined}
         */
        async loadSilenceCues() {
            let elements = VideosLoadedEvent.getVideosElements();

            SilenceCueManager.cueTrack = elements.primaryVideo.addTextTrack("metadata", "silenceCues");

            //Todo: add cached cues here

            //Inject function into user page to access Panopto object
            var injectedFunc = () => {
                //There's no way to create a texttrack with id and insert it into the video. Thus, we'll have to do this the old fashioned way
                //let cueTrack = document.getElementsByTagName("video")[0].textTracks.getTrackById("SilenceCueTrack");
                let textTrackList = document.getElementsByTagName("video")[0].textTracks;
                let cueTrack = null;
                for (let i = 0; i < textTrackList.length; i++) {
                    if (textTrackList[i].label === "silenceCues") {
                        cueTrack = textTrackList[i];
                        break;
                    }
                }
                //Units are in seconds
                const videoDOMs = document.getElementsByTagName("video");
                const FAST_JUMP_THRESHOLD = 0.3; //Wait until this amt is skipped before checking if need to resync
                const DESYNC_LIMIT = 20; //Wait until total time skipped reaches this value before syncing
                let lastSynced = 0;
                //Todo: add setting configs to influence playback rate
                cueTrack.oncuechange = function () {
                    const cues = cueTrack.activeCues;
                    //If on enter
                    if (cues.length > 0) {
                        //Calculate offset and skip if necessary
                        //Prefer fast jump by currentTime. However, can cause desyncing if multiple streams involved.
                        let offset = cues[0].endTime - cues[0].startTime;
                        lastSynced += offset;
                        //If don't have secondary or still within desync limit
                        if (!Panopto.Viewer.Viewer.activeSecondary() || offset > FAST_JUMP_THRESHOLD) {
                            for (let i = 0; i < videoDOMs.length; i++) {
                                if (videoDOMs[i]) {
                                    //console.log(`${videoDOMs[i].currentTime}`);
                                    videoDOMs[i].currentTime += offset;
                                }
                            }
                        } else if (lastSynced > DESYNC_LIMIT) {
                            //Call Panopto's API to reposition and avoid desync issue
                            //Panopto's implementation can be a bit laggy though, so only call if it runs the risk of desync
                            //However this lag is warranted because it helps to prevent weird issues
                            Panopto.Viewer.Viewer.position(cues[0].endTime);
                            lastSynced = 0;
                            console.info("Synced using Panopto API");
                        }
                        //console.log(offset, lastSynced)
                    }
                };
            }
            let ctxBridge = new ContextBridge(injectedFunc);
            ctxBridge.exec();

            //Set to show tracks after a brief delay (Doesn't work without delay, this is a hotfix)
            this.updateVisibility();

            console.log("Silence Cues loaded");
        };

        /**
         * TODO: abstractify this segment, because this is copied wholesale from the transcript display segment to apply it to silence cues.
         */
        async updateVisibility() {
            while (true) {
                if (Settings.getDataAsObject()[Settings.keys.silencetrimming])
                    await this.show();
                else 
                    await this.hide();

                //Getting really tired of my subtitles not appearing so i'm going to long poll this
                await sleep(this.updateVisibilitySleepTime);
                if (this.updateVisibilitySleepTimeMax > this.updateVisibilitySleepTime)
                    this.updateVisibilitySleepTime += this.updateVisibilitySleepTimeIncrement;
            }
        }

        async hide() {
            return await this.setState("disabled");
        }

        async show() {
            return await this.setState("hidden");
        }
    
        async setState(state) {
            //Set to show subtitles after a brief delay (Doesn't work without delay, this is a hotfix)
            let showing = true;
            do {
                showing = true;
                await sleep(500);
                //Show track(s)
                SilenceCueManager.cueTrack.mode = state;
                await sleep(200);
                //verify this.tracks are indeed showing
                showing &= SilenceCueManager.cueTrack.mode === state;
            } while(!showing);
        }

        /**
         * Convert id to index (e.g. "00012.ts" to 12)
         * @param {String} id relurl of the TS file
         * @returns {Number} returns the number (i.e. index) of the TS file
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
         * @param {Number} startTime Starting time of the TS file
         * @param {Number} endTime Ending time of the TS file
         * @param {Array.<{isSpeaking: Boolean, time: Number}>} results results from prociessing a TS file
         * @returns {undefined}
         */
        static addSilenceCues(id, startTime, endTime, results) {
            //console.info(id, startTime, results);
            //let index = SilenceCueManager.idToIndex(id);
            //Assume is not speaking at the start, skip any time from start to next speaking
            if (results.length > 0) {
                let skippedToFirstSpeech = false;
                for (let i = 0; i < results.length; i++) {
                    if (results[i].isSpeaking) {
                        //If is first speech of results
                        if (!skippedToFirstSpeech) {
                            SilenceCueManager.addSilentCue(startTime, results[i].time);
                            skippedToFirstSpeech = true;
                        }
                    } else {//it is not speaking
                        //Last, jump to end
                        if (i >= results.length - 1) {
                            //Jump to last since it is not speaking
                            SilenceCueManager.addSilentCue(results[i].time, endTime);
                        } else if (results[i + 1].isSpeaking) {
                            //Else if next is speaking, jump to next
                            SilenceCueManager.addSilentCue(results[i].time, results[i + 1].time);
                        }
                    }
                }
            } else {
                //if there's nothing, then no speech so skip entire segment
                SilenceCueManager.addSilentCue(startTime, endTime);
            }
        }

        /**
         * Add silent cue for video to take action
         * @param {Number} startTime start of silence
         * @param {Number} endTime end of silence
         * @returns {undefined}
         */
        static addSilentCue(startTime, endTime) {
            SilenceCueManager.cueTrack.addCue(new VTTCue(startTime, endTime, ""));
        }

        /**
         * Add results from TSTracker to cache
         * INCOMPLETE!!
         * @param {String} id relurl of the TS file
         * @param {Array} results [{isSpeaking: Boolean, time: Number}, ...]
         * @returns {undefined}
         */
        static addToCache(id, results) {
            //Save to map
            SilenceCueManager.cuesMap[SilenceCueManager.idToIndex(id)] = results;
            //TODO: Do other caching stuff
        }
    }

    //Static variables
    SilenceCueManager.cueTrack = null;
    SilenceCueManager.cuesMap = {};

    return SilenceCueManager;
})();