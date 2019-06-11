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
                //Make use of the flowplayer on the website to keep us updated on TS files are in use
                //This automatically picks the 1st video which should carry the audio
                players[0].engine.hlsjs.observer.addListener("hlsFragLoading",(callbackId, details) => {
                    console.log("hlsFragLoading: " + details.frag.url);
                    //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
                    //Make the request in the webpage environment in case there are any CORS issues
                    var req = new XMLHttpRequest();
                    req.open("GET", details.frag.url, true);
                    req.responseType = "arraybuffer";
                    req.onload = function(e) {
                        bridgeCallback({frag: details.frag, data: req.response});
                    };
                    req.send();
                });
            };

            var ctxBridge = new ContextBridge(injectedFunc, "TsTrackingEvent", (event) => {
                if (event != undefined && event.detail != undefined && event.detail.data != undefined) {
                    //debugger;
                    self.process(event.detail.frag.relurl, event.detail.frag.start, event.detail.data);
                }
            });
            ctxBridge.connect();
        });
    };

    /**
     * Process the arraybuffer and pass it into an audio context to be decoded
     * @param {String} id relurl of the ts file being retrieved
     * @param {Number} startTime start time of the TS file
     * @param {ArrayBuffer} arraybuffer array buffer, data
     */
    TSTracker.prototype.process = function(id, startTime, arraybuffer) {
        //https://stackoverflow.com/questions/8074152/is-there-a-way-to-use-the-web-audio-api-to-sample-audio-faster-than-real-time
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        //This will be a AAC LC file
        //This processing can maybe be done in a web worklet
        var audioByteStream = WebModule["MPEG2TS"].toByteStream(WebModule["MPEG2TS"].demux(new Uint8Array(arraybuffer), 0).AUDIO_TS_PACKET);
        //Some browsers may not support AAC but chrome does
        audioCtx.decodeAudioData(Uint8ArrayToArrayBuffer(audioByteStream), 
            (buffer) => { this.postDecodeAudioData(id, startTime, buffer); },
            (err) => { console.log("Error with decoding audio data" + err.err); });
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
        //Start source
        source.start(0);
        //Start processing the offline context
        await offlineCtx.startRendering();
        //On receiving results from processor, process results
        processor.port.onmessage = ((event) => {
            if (event.data && event.data.results) this.insertSilentSections(id, startTime, event.data);
        }).bind(this);
        //Once finished, request results from processor
        processor.port.postMessage({requestResult: 1});
    }

    /**
     * Take the results from the webworklet and insert into the video as cues
     * @param {String} id relurl of the ts file being retrieved
     * @param {Number} startTime start time of the TS file
     * @param {Object} results array buffer, data
     */
    TSTracker.prototype.insertSilentSections = function(id, startTime, results) {
        results.results.forEach(x => x.time += startTime);
        //Todo: cache
        SilenceCueManager.addToCache(id, results.results);
        SilenceCueManager.addSilenceCues(id, results.results);
    }

    return TSTracker;
})();