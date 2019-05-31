/**
 * The TSTracker class injects code into the page to detect when a TS file is loaded.
 */
TSTracker = (function() {
    var TSTracker = function() {};
    /**
     * Initialization, setup a bridge to detect which TS files are loaded
     */
    TSTracker.prototype.init = function() {
        return;//temporarily disable feature
        var self = this;
        VideosLoadedEvent.subscribe(() => {
            //This function is called in the user environment
            var injectedFunc = () => {
                //Make use of the flowplayer on the website to keep us updated on TS files are in use
                flowplayer().engine.hlsjs.observer.addListener("hlsFragLoading",(callbackId, details) => {
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
            var callback = async function(event) {
                debugger;
                self.processArraybuffer(event.detail.data);
            };
            var ctxBridge = new ContextBridge(injectedFunc, "TsTrackingEvent", callback);
            ctxBridge.connect();
        });
    };

    TSTracker.prototype.processArraybuffer = function(arraybuffer) {
        //https://stackoverflow.com/questions/8074152/is-there-a-way-to-use-the-web-audio-api-to-sample-audio-faster-than-real-time
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        //This will be a AAC LC file
        console.log(arraybuffer);
        var audioByteStream = WebModule["MPEG2TS"].toByteStream(
            WebModule["MPEG2TS"].demux(new Uint8Array(arraybuffer), 0).AUDIO_TS_PACKET
        );
        console.log(audioByteStream);
        //Some browsers may not support AAC but chrome does
        audioCtx.decodeAudioData(Uint8ArrayToArrayBuffer(audioByteStream), this.postDecodeAudioData.bind(this), 
        (err) => { 
            console.log("Error with decoding audio data" + err.err); 
        });
    }

    TSTracker.prototype.postDecodeAudioData = function(buffer) {
        console.log(buffer);
        const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
        // Loads module script via AudioWorklet.
        offlineCtx.audioWorklet.addModule(chrome.extension.getURL("/panopto/js/jsmpeg/vad-audio-worklet-processor.js")).then(() => {
            const source = offlineCtx.createBufferSource();
            const processor = new AudioWorkletNode(offlineCtx, 'vad-audio-worklet-processor');
            //Analyser designed for realtime
            //const analyser = offlineCtx.createAnalyser();
            //analyser.fftSize = 2048;
            //analyser.smoothingTimeConstant = 0.25;
            processor.port.onmessage = (function(event, p = processor) { 
                let fft = new FFTJS(128);
                let out = fft.createComplexArray();
                fft.realTransform(out, event.data.a[0][0]);
                //debugger;
            }).bind(this);
            source.buffer = buffer;
            source.connect(processor);
            processor.connect(offlineCtx.destination);
            //source.connect(analyser);
            //analyser.connect(offlineCtx.destination);

            source.start(0);
            offlineCtx.startRendering().then(function(renderedBuffer, proc = processor) {
                proc.port.postMessage({requestResult: 1});
            }).catch((err) => {
                console.log('Rendering failed: ' + err);
                // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
            });
        }).catch((err) => {
            console.log("Error loading worklet module: " + err);
        });
    }

    return TSTracker;
})();