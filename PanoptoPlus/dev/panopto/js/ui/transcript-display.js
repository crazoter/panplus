/**
 * @file TranscriptDisplay, includes code that will load the transcript, then inject the subtitles as cues into the first video's texttrack.
 * If there is a second video, then when the cue is reached, the subtitle will be injected into the second video.
 * This is to circumvent the issue of the variable offset between the 1st and 2nd video currentTime.
 */
let TranscriptDisplay = (() => {
    /**
     * TranscriptDisplay, includes code that will load the transcript, then inject the subtitles as cues into the first video's texttrack.
     * If there is a second video, then when the cue is reached, the subtitle will be injected into the second video.
     * This is to circumvent the issue of the variable offset between the 1st and 2nd video currentTime.
     */
    class TranscriptDisplay {
        /**
         * Initialize with regards to settings
         * @param {Object} settings Settings object
         */
        constructor(settings) {
            if (settings[Settings.keys.machinetranscript]) {
                this.tracks = [];
                this.updateVisibilitySleepTime = 500;
                this.updateVisibilitySleepTimeIncrement = 100;
                this.updateVisibilitySleepTimeMax = 1000;
                this.init();
            }
        }

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
            VideosLoadedEvent.subscribe(() => { 
                this.loadTranscriptDisplay();
            });
        }

        /**
         * Load videos with subtitle tracks and show subtitles. Also prepares transcript
         * @returns {undefined}
         */
        async loadTranscriptDisplay() {
            const transcript = await TranscriptRequester.get(new TranscriptSourcePanopto());
            //this.initTranscriptTab(transcript);//This has been moved into load subtitles
            this.loadSubtitles(transcript);
        }

        /**
         * Initialize transcript tab
         * @param {Transcript} transcript
         */
        async initTranscriptTab(transcript) {
            if (transcript.data.length > 0) {
                $('#megalist-transcript').megalist();
                $('#megalist-transcript').megalist('setDataProvider', (() => {
                    let result = [];
                    for (let i = 0; i < transcript.data.length; i++) {
                        result.push({
                            time: (((transcript.data[i].time / 60) | 0) + ((transcript.data[i].time | 0) % 60 / 100)).toFixed(2).replace('.',':'),
                            text: transcript.data[i].text
                        });
                    }
                    return result;
                })());
                $('#megalist-transcript').megalist('setLabelFunction', (item) => {
                    return `<div><b>${item.time}:</b> ${item.text}</div>`;
                });

                let injectedFunc = () => {
                    let videoDOM = document.getElementsByTagName("video")[0];
                    let track = null;
                    for(let i = 0; i < videoDOM.textTracks.length; i++) {
                        if (videoDOM.textTracks[i].label == "Machine Transcribed") {
                            track = videoDOM.textTracks[i];
                            break;
                        }
                    }

                    if (track == null) console.error("Track cannot be null");

                    bridgeReceiveDataCallback((event) => {
                        Panopto.Viewer.Viewer.position(track.cues[parseInt(event.detail)].startTime);
                    });
                };

                let ctxBridge = new ContextBridge(injectedFunc, "megalist_trigger");
                ctxBridge.connect();
                
                $('#megalist-transcript').on('change', (event) => {
                    ctxBridge.send(event.selectedIndex);
                });
            }
        }

        /**
         * Load videos with subtitle tracks and show subtitles.
         * @param {Transcript} transcript
         * @returns {undefined}
         */
        async loadSubtitles(transcript) {
            const cueArray = transcript.toVTTCueArray();
            console.info(cueArray.length + " Subtitle cues detected");
            //Stop if there are no cues in the first place
            if (cueArray.length == 0) {
                $("#sidebar-tab-pg-2").html("No transcript & subtitles available for this webcast.");
                //alert("No subtitles available for this webcast.");
                return;
            }
            let elements = VideosLoadedEvent.getVideosElements();
            //Add track(s) for video(s)
            //let tracks = [];
            this.tracks = [];
            for (var i = 0; i < elements.all.length; i++) {
                this.tracks.push(elements.all[i].addTextTrack("captions", "Machine Transcribed", "en"));
            }
            //Add a sleep here to avoid issues with adding cues
            await sleep(100);
            //Add cues only for main video
            for (let j = 0; j < cueArray.length; j++) {
                cueArray[j].id = j;
                this.tracks[elements.primaryVideoIndex].addCue(cueArray[j]);
            }
            //If 2 videos, sync by adding cue to currentTime when the cue is played.
            if (elements.all.length === 2) {
                let otherVideoIndex = elements.primaryVideoIndex ^ 1;
                let self = this;
                this.tracks[elements.primaryVideoIndex].oncuechange = function () {
                    //function is embedded in the code here because of the need to access previous variables for performance reasons
                    let cues = self.tracks[elements.primaryVideoIndex].activeCues;
                    //remove all cues before adding any new ones
                    while (self.tracks[otherVideoIndex].cues && self.tracks[otherVideoIndex].cues.length > 0) {
                        self.tracks[otherVideoIndex].removeCue(self.tracks[otherVideoIndex].cues[0]);
                    }

                    if (cues && cues.length > 0) {
                        //Entered into a new cue
                        //Implementation 1: Insert with fixed death time
                        /*
                        if (this.tracks[otherVideoIndex].cues.getCueById(cues[0].startTime) === null) {
                            //Add cue with offset only if it hasn't already been added
                            let offset = elements.secondaryVideo.currentTime - elements.primaryVideo.currentTime;
                            let cue = new VTTCue(cues[0].startTime + offset, 
                                cues[0].endTime + offset, 
                                cues[0].text);
                            cue.id = cues[0].startTime;
                            this.tracks[otherVideoIndex].addCue(cue);
                        }*/
                        //Implementation 2: Clear cues, then insert cue
                        let offset = elements.secondaryVideo.currentTime - elements.primaryVideo.currentTime;
                        let currentCue = new VTTCue(cues[0].startTime + offset, 
                            cues[0].endTime + offset, 
                            cues[0].text);
                            self.tracks[otherVideoIndex].addCue(currentCue);

                        //Set selected index
                        $('#megalist-transcript').megalist('setSelectedIndex', parseInt(cues[0].id));
                    }
                };
            } else if (videoDOMs.length > 2) {
                alert("Extension currently doesn't support subtitling of more than 2 video streams.");
            }

            this.initTranscriptTab(transcript);

            //Set to show subtitles after a brief delay (Doesn't work without delay, this is a hotfix)
            await this.updateVisibility();
            console.log("TranscriptDisplay loaded");
        }

        async updateVisibility() {
            while (true) {
                if (Settings.getDataAsObject()[Settings.keys.subtitles])
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
            return await this.setState("hidden");
        }

        async show() {
            return await this.setState("showing");
        }
    
        async setState(state) {
            //Set to show subtitles after a brief delay (Doesn't work without delay, this is a hotfix)
            let showing = true;
            do {
                showing = true;
                await sleep(500);
                //Show track(s)
                for (let i = 0; i < this.tracks.length; i++)
                    this.tracks[i].mode = state;
                await sleep(200);
                //verify this.tracks are indeed showing
                for (let i = 0; i < this.tracks.length; i++)
                    showing &= this.tracks[i].mode === state;
            } while(!showing);
        }
    }
    return TranscriptDisplay;
})();