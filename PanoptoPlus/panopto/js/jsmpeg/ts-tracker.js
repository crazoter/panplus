/**
 * The TSTracker class injects code into the page to detect when a TS file is loaded.
 */
TSTracker = (function() {
    var TSTracker = function() {};
    /**
     * Initialization, setup a bridge to detect which TS files are loaded
     */
    TSTracker.prototype.init = function() {
        //return;//temporarily disable feature
        var self = this;
        this.noiseReferenceLineFeatures = null;
        this.noiseReferenceCallbacks = $.Callbacks();
        VideosLoadedEvent.subscribe(() => {
            //This function is called in the user environment
            var injectedFunc = () => {
                //Optimize the loading of TS files and buffering
                let players = [];
                players.push(flowplayer(0));
                let tmp = flowplayer(1);
                if (tmp != undefined) {
                    players.push(tmp);
                }
                players.forEach(player => {
                    player.engine.hlsjs.config.startFragPrefetch = true;
                    player.engine.hlsjs.currentLevel = 0;
                    player.engine.hlsjs.config.maxFragLookUpTolerance = 0.20;
                    player.engine.hlsjs.config.maxStarvationDelay = 0.5;
                    player.engine.hlsjs.config.maxBufferLength = 900;
                    player.engine.hlsjs.config.maxMaxBufferLength = 1500;
                    player.engine.hlsjs.config.maxBufferSize = 150000000;
                    player.engine.hlsjs.config.stretchShortVideoTrack = true;
                });

                var request = function(url, frag, isNoiseSample) {
                    //console.log("hlsFragLoading: " + url);
                    //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
                    //Make the request in the webpage environment in case there are any CORS issues
                    var req = new XMLHttpRequest();
                    req.open("GET", url, true);
                    req.responseType = "arraybuffer";
                    req.onload = function(e) {
                        bridgeCallback({frag: frag, data: req.response, isNoiseSample: isNoiseSample});
                    };
                    req.send();
                }

                var retrieveFirstTS = function(url) {
                    let tmp = url.substr(0,url.lastIndexOf('/') + 1);
                    return `${tmp}${new Array(url.length - tmp.length - 3).fill(0).join('')}.ts`;
                }

                let noiseSampleRequested = false;
                //Make use of the flowplayer on the website to keep us updated on TS files are in use
                //This automatically picks the 1st video which should carry the audio
                players[0].engine.hlsjs.observer.addListener("hlsFragLoading",(callbackId, details) => {
                    if (!noiseSampleRequested) {
                        request(retrieveFirstTS(details.frag.url), details.frag, true);
                        noiseSampleRequested = true;
                    }
                    request(details.frag.url, details.frag, false);
                });
            };

            var ctxBridge = new ContextBridge(injectedFunc, "TsTrackingEvent", (event) => {
                if (event != undefined && event.detail != undefined && event.detail.data != undefined) {
                    self.process(event.detail.isNoiseSample, event.detail.frag.relurl, event.detail.frag.start, event.detail.data);
                }
            });
            ctxBridge.connect();
        });
    };

    /**
     * Process the arraybuffer and pass it into an audio context to be decoded
     * @param {Boolean} isNoiseSample is TS sample to retrieve noise reference from
     * @param {String} id relurl of the ts file being retrieved
     * @param {Number} startTime start time of the TS file
     * @param {ArrayBuffer} arraybuffer array buffer, data
     */
    TSTracker.prototype.process = function(isNoiseSample, id, startTime, arraybuffer) {
        //https://stackoverflow.com/questions/8074152/is-there-a-way-to-use-the-web-audio-api-to-sample-audio-faster-than-real-time
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        //This will be a AAC LC file
        //This processing can maybe be done in a web worklet
        var audioByteStream = WebModule["MPEG2TS"].toByteStream(WebModule["MPEG2TS"].demux(new Uint8Array(arraybuffer), 0).AUDIO_TS_PACKET);
        //Some browsers may not support AAC but chrome does
        audioCtx.decodeAudioData(Uint8ArrayToArrayBuffer(audioByteStream), 
            (buffer) => { 
                if (isNoiseSample || this.noiseReferenceLineFeatures != null) {
                    this.postDecodeAudioData(id, startTime, buffer); 
                } else {
                    this.waitForNoiseSample().then(() => {
                        this.postDecodeAudioData(id, startTime, buffer);
                    });
                }
            },
            (err) => { console.log("Error with decoding audio data" + err.err); });
    }

    TSTracker.prototype.waitForNoiseSample = function() {
        return new Promise((resolve) => {
            this.noiseReferenceCallbacks.add(function() { resolve(); });
        });
    }

    /**
     * Process the decoded buffer in a webworklet
     * @param {String} id relurl of the ts file being retrieved
     * @param {Number} startTime start time of the TS file
     * @param {ArrayBuffer} buffer array buffer, data
     */
    TSTracker.prototype.postDecodeAudioData = async function(id, startTime, buffer) {
        const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
        // Loads module script via AudioWorklet.
        await offlineCtx.audioWorklet.addModule(chrome.extension.getURL("/panopto/js/jsmpeg/vad-audio-worklet-processor.js"));
        const source = offlineCtx.createBufferSource();
        const processor = new AudioWorkletNode(offlineCtx, 'vad-audio-worklet-processor');
        //Join everything like lego
        source.buffer = buffer;
        source.connect(processor);
        processor.connect(offlineCtx.destination);
        //Start processing the offline context
        //await offlineCtx.startRendering();
        //On receiving results from processor, process results
        processor.port.onmessage = ((event) => {
            //debugger;
            if (event.data) {
                switch (event.data.msgEnum) {
                    case TSTracker.MessageEnums.NORMAL_RESULTS: 
                        //console.log(event.data.data);
                        this.insertSilentSections(id, startTime, event.data.data);
                        break;
                    case TSTracker.MessageEnums.NOISE_RESULTS: 
                        //console.log("TSTracker NOISE RES: ");
                        //console.log(event.data.data);
                        if (event.data.data == null) throw new Error("Invalid noise reference line features");
                        this.noiseReferenceLineFeatures = event.data.data;
                        this.noiseReferenceCallbacks.fire();
                        this.noiseReferenceCallbacks.empty();
                        break;
                    case TSTracker.MessageEnums.INITIALIZATION_SUCCESS:        
                        //console.log("TSTracker INIT SUCCESS: ");
                        //console.log(event.data.data);
                        //Start source
                        source.start(0);
                        offlineCtx.startRendering().then((buffer) => {
                            //Once finished, request results from processor
                            processor.port.postMessage({msgEnum: TSTracker.MessageEnums.REQUEST_RESULTS});
                        });
                        break;
                    case TSTracker.MessageEnums.DEBUG: 
                        console.log("TSTracker DEBUG: ");
                        console.log(event.data.data);
                        //debugger;
                        break;
                }
            } else {
                console.warn("TSTracker processor returns undefined results");
            }
        }).bind(this);
        //Begin initialization process
        processor.port.postMessage({msgEnum: 0, data: this.noiseReferenceLineFeatures});
    }

    /**
     * Take the results from the webworklet and insert into the video as cues
     * @param {String} id relurl of the ts file being retrieved
     * @param {Number} startTime start time of the TS file
     * @param {Object} results array, data
     */
    TSTracker.prototype.insertSilentSections = function(id, startTime, data) {
        data.forEach(x => x.time += startTime);
        //Todo: cache
        SilenceCueManager.addToCache(id, data);
        SilenceCueManager.addSilenceCues(id, data);
    }

    TSTracker.MessageEnums = {
        INITIALIZATION_PARAMS: 0,
        INITIALIZATION_SUCCESS: 1,
        NOISE_RESULTS: 2,
        NORMAL_RESULTS: 3,
        REQUEST_RESULTS: 4,
        DEBUG: 5
    };

    return TSTracker;
})();