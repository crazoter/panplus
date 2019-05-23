/**
 * The TSTracker class injects code into the page to detect when a TS file is loaded.
 */
TSTracker = (function() {
    var TSTracker = function() {};
    /**
     * Initialization, setup a bridge to detect which TS files are loaded
     */
    TSTracker.prototype.init = function() {
        var self = this;
        VideosLoadedEvent.subscribe(() => {
            //This function is called in the user environment
            var injectedFunc = () => {
                //Make use of the flowplayer on the website to keep us updated on TS files are in use
                flowplayer().engine.hlsjs.observer.addListener("hlsFragLoading",(callbackId, details) => {
                    console.log("hlsFragLoading: " + details.frag.url);
                    //Make the request in the webpage environment in case there are any CORS issues
                    var req = new XMLHttpRequest();
                    req.open("GET", details.frag.url, true);
                    req.responseType = "arraybuffer";
                    req.onload = function(e) {
                        bridgeCallback(req.response);
                    };
                    req.send();
                });
            };
            var callback = async function(event) {
                self.processURL(event.detail);
            };
            var ctxBridge = new ContextBridge(injectedFunc, "TsTrackingEvent", callback);
            ctxBridge.connect();
        });
    };

    TSTracker.prototype.processURL = function(arraybuffer) {
        return;
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createBufferSource();

        //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
        //var req = new XMLHttpRequest();
        //req.open("GET", url, true);
        //req.responseType = "arraybuffer";
        //req.onload = function(e) {
        //This will be a AAC LC file
        var audioByteStream = WebModule["MPEG2TS"].toByteStream(
            WebModule["MPEG2TS"].demux(new Uint8Array(arraybuffer),0).AUDIO_TS_PACKET
        );
        //Some browsers may not support AAC but chrome does
        audioCtx.decodeAudioData(Uint8ArrayToArrayBuffer(audioByteStream), function(buffer) {
            //debugger;
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            },
        function(err){ 
            //debugger;
            console.log("Error with decoding audio data" + err.err); 
        });
        debugger;
            //debugger;
        //};
        //req.send();
    }

    return TSTracker;
})();