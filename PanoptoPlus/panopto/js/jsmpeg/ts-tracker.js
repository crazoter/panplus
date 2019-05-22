TSTracker = (function() {
    //Load wasmModule
    var TSTracker = function() {
        this.wasmModuleLoadedCallbacks = $.Callbacks();
        if (JSMpeg.WASMModule.IsSupported()) {
            this.wasmModule = new JSMpeg.WASMModule();
            this.wasm = JSMpeg.Base64ToArrayBuffer(JSMpeg.WASM_BINARY_INLINED);
            this.wasmModule.loadFromBuffer(this.wasm, this.startLoading.bind(this));
        }
        this.wasmModuleLoaded = false;
    }

    TSTracker.prototype.init = function() {
        var self = this;
        VideosLoadedEvent.subscribe(() => {
            //This function is called in the user environment
            var injectedFunc = () => {
                //Make use of the flowplayer on the website to keep us updated on TS files are in use
                flowplayer().engine.hlsjs.observer.addListener("hlsFragLoading",(callbackId, details) => {
                    console.log("hlsFragLoading: " + details.frag.url);
                    bridgeCallback(details.frag.url);
                });
            };
            var callback = async function(event) {
                if (self.wasmModuleLoaded) self.processURL(event.detail);
                else self.wasmModuleLoadedCallbacks.add(() => self.processURL(event.detail));
            };
            var ctxBridge = new ContextBridge(injectedFunc, "TsTrackingEvent", callback);
            ctxBridge.connect();
        });
    };

    TSTracker.prototype.processURL = function(url) {
        debugger;
        //Process TS file URL using jsmpeg project, but only the audio portion
        //Code lifted from player.js constructor function
        var jsmpegOptions, sourceAjax, demuxerTS, mp2Audio, audioOut;
        jsmpegOptions = {};
        sourceAjax = new JSMpeg.Source.Ajax(url, jsmpegOptions);
        demuxerTS = new JSMpeg.Demuxer.TS(jsmpegOptions);

        //Checks for whether or not webassembly can be used is already done above
        jsmpegOptions.wasmModule = this.wasmModule;

        //Extending decoders to allow for audio processing ASAP.
        //The term "Offline" is borrowed from https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
        mp2Audio = jsmpegOptions.wasmModule ? 
            new OfflineMP2AudioWASM(jsmpegOptions) : 
            new OfflineMP2Audio(jsmpegOptions);
        
        //Creating my own VoiceDetector class because the audioOut used in the library is irrelevant to my needs
        audioOut = new VoiceDetector();

        //Using the library's callback system
        sourceAjax.connect(demuxerTS);          
        demuxerTS.connect(JSMpeg.Demuxer.TS.STREAM.AUDIO_1, mp2Audio);
        mp2Audio.connect(audioOut);
        sourceAjax.start();

        audioOut.finishedProcessing((results) => {
            //Setup cue 
        });
    }

    /**
     * Called once WASMModule is loaded if Webassembly is supported
     */
    TSTracker.prototype.startLoading = function() {
        this.wasmModuleLoaded = true;
        this.wasmModuleLoadedCallbacks.fire();
        this.wasmModuleLoadedCallbacks.empty();
    };

    return TSTracker;
})();