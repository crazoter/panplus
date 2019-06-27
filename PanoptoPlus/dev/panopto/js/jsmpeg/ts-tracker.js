/**
 * @file The TSTracker class injects code into the page to detect when a TS file is loaded. Currently also handles processing of TS files to detect silences.
 */
TSTracker = (() => {
    /**
     * The TSTracker class injects code into the page to detect when a TS file is loaded. Currently also handles processing of TS files to detect silences.
     */
    class TSTracker {
        /**
         * Constructor is empty
         */
        constructor() {}

        /**
         * Initialization, setup a bridge to detect which TS files are loaded
         * @returns {undefined}
         */
        init() {
            //return;//temporarily disable feature
            var self = this;
            this.timeArr = [];
            this.distanceArr = [];
            this.maxBufferedTSFilesLimit = 20;
            this.minBufferedTSFilesLimit = 14;
            this.bufferArrayBufferTimeout = 500;
            this.bufferArrayBufferSecondTimeout = 30000;
            this.bufferedTSFiles = [];
            this.bufferedTSFilesMetadata = [];
            this.bufferLastPushTime = Date.now();
            this.processedTSFilesMap = {}; //Prevent duplicate processing
            //this.OSTree = new OrderStatisticTree();
            //this.samplesBeforeCalculatingThreshold = 
            this.noiseReferenceLineFeatures = null;
            this.noiseReferenceCallbacks = $.Callbacks();
            VideosLoadedEvent.subscribe(() => {
                //This function is called in the user environment
                //#region injected function
                var injectedFunc = () => {
                    //Optimize the loading of TS files and buffering
                    let players = [];
                    players.push(flowplayer(0));
                    //If has second player
                    if (Panopto.Viewer.Viewer.activeSecondary()) {
                        players.push(flowplayer(1));
                    }
                    
                    //Set configs for optimization
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

                    var request = function(url, frag, options) {
                        if (!options)
                            options = {isNoiseSample: false, startProcessingFrom: 0};
                        //console.log("hlsFragLoading: " + url);
                        //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
                        //Make the request in the webpage environment in case there are any CORS issues
                        var req = new XMLHttpRequest();
                        req.open("GET", url, true);
                        req.responseType = "arraybuffer";
                        req.onload = function(e) {
                            bridgeCallback({frag: frag, data: req.response, options: options});
                        };
                        req.send();
                    }

                    var noiseTSParameters = async function(url) {
                        let tmp = url.substr(0,url.lastIndexOf('/') + 1);
                        let indexFilePath = `${tmp}index.m3u8`;
                        let indexFileData = null;
                        try {
                            indexFileData = await $.ajax({url: indexFilePath});
                        } catch (err) { console.error(err); }
                        if (indexFileData) {
                            indexFileData = indexFileData.split('\n');
                            //Use the last 1.3s of the last TS file, assume the last 1s is just noise. 
                            //The noise reference will only use 100ms
                            //Notice that panopto sometimes "Fades out" the last second of the webcast
                            let startProcessingFrom = 1.3;
                            let lastTSUrl = "";
                            let lastTSId = "";
                            let foundDataNeeded = 0;
                            for (let i = indexFileData.length - 1; i > 0; i--) {
                                if (indexFileData[i].indexOf(".ts") > -1) {
                                    lastTSId = indexFileData[i];
                                    lastTSUrl = `${tmp}${lastTSId}`;
                                    foundDataNeeded++;
                                }
                                else if (indexFileData[i].indexOf("#EXTINF:") > -1) {
                                    //Let value be the duration - 1.3s
                                    startProcessingFrom = parseFloat(indexFileData[i].substring(8, indexFileData[i].length - 1)) - startProcessingFrom;
                                    foundDataNeeded++;
                                    if (startProcessingFrom < 0) {
                                        //If last TS was too short, use the 2nd last TS instead
                                        startProcessingFrom *= -1;//Reset startProcessingFrom
                                        // 512 / 48000 * 30 samples
                                        if (startProcessingFrom < 0.330) startProcessingFrom = 0.330;//ensure there's enough time 
                                        foundDataNeeded = 0;
                                    }
                                }
                                if (foundDataNeeded >= 2) 
                                    break;
                            }
                            return {url: lastTSUrl, options: {isNoiseSample: true, startProcessingFrom: startProcessingFrom, id: lastTSId}};
                        } else return null;
                        //return `${tmp}${new Array(url.length - tmp.length - 3).fill(0).join('')}.ts`;
                    }

                    let noiseSampleRequested = false;
                    //Make use of the flowplayer on the website to keep us updated on TS files are in use
                    //This automatically picks the 1st video which should carry the audio
                    players[0].engine.hlsjs.observer.addListener("hlsFragLoading",(callbackId, details) => {
                        if (!noiseSampleRequested) {
                            noiseTSParameters(details.frag.url).then((params) => {
                                if (params) {
                                    request(params.url, details.frag, params.options);
                                    noiseSampleRequested = true;
                                }
                            });
                        }
                        request(details.frag.url, details.frag);
                    });
                    console.info("TS-Tracker initialized");
                };
                //#endregion

                var ctxBridge = new ContextBridge(injectedFunc, "TsTrackingEvent", (event) => {
                    if (event != undefined && event.detail != undefined && event.detail.data != undefined) {
                        if (!self.processedTSFilesMap[event.detail.frag.relurl] || event.detail.options.isNoiseSample) {
                            if (!event.detail.options.isNoiseSample) {
                                self.processedTSFilesMap[event.detail.frag.relurl] = 1;
                            }
                            //console.info(event.detail.data, event.detail.options);
                            self.process(event.detail.data, {
                                isNoiseSample: event.detail.options.isNoiseSample,
                                startProcessingFrom: event.detail.options.startProcessingFrom,
                                id: event.detail.options.id || event.detail.frag.relurl,
                                startTime: event.detail.frag.start,
                                duration: event.detail.frag.duration,
                            });
                        }
                    }
                });
                ctxBridge.connect();
            });
        };

        /**
         * Process the arraybuffer and pass it into an audio context to be decoded
         * @param {ArrayBuffer} arraybuffer array buffer, data
         * @param {Object} options {isNoiseSample: boolean, startProcessingFrom: relative time, id: "00123.ts", startTime: Number, duration: Number};
         * @returns {undefined}
         */
        process(arraybuffer, options) {
            //This will be a AAC LC file
            //This processing can maybe be done in a web worklet
            var audioByteStream = WebModule["MPEG2TS"].toByteStream(WebModule["MPEG2TS"].demux(new Uint8Array(arraybuffer), 0).AUDIO_TS_PACKET);
            //Some browsers may not support AAC but chrome does
            if (options.isNoiseSample) {
                this.decodeAudioData(audioByteStream, [options]);
            } else {
                this.waitForNoiseSample().then(() => {
                    this.bufferArrayBuffer(audioByteStream, options);
                });
            }
        }

        /**
         * Decode the audio data and pass it into an audio context to be decoded
         * @param {Uint8Array} audioByteStream data
         * @param {Array.Object} optionsArray Array of {isNoiseSample: boolean, startProcessingFrom: relative time, id: "00123.ts", startTime: Number, duration: Number};
         * @returns {undefined}
         */
        decodeAudioData(audioByteStream, optionsArray) {
            console.info(audioByteStream);
            //https://stackoverflow.com/questions/8074152/is-there-a-way-to-use-the-web-audio-api-to-sample-audio-faster-than-real-time
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtx.decodeAudioData(Uint8ArrayToArrayBuffer(audioByteStream), 
                (buffer) => {
                    this.postDecodeAudioData(buffer, optionsArray); 
                    audioCtx.close();
                },
                (err) => { console.error("Error with decoding audio data" + err.err); });
        }

        /**
         * Wait for noise sample, only proceed after noise has been processed
         * @returns {Promise} Promise with resolve with 0 parameters. Just waits for the noise reference to be created.
         */
        waitForNoiseSample() {
            return new Promise((resolve) => {
                if (this.noiseReferenceLineFeatures == null)
                    this.noiseReferenceCallbacks.add(() => { resolve(); });
                else resolve();
            });
        }

        /**
         * Put ArrayBuffers into an array. When there are enough files, send for processing.
         * @param {ArrayBuffer} arraybuffer array buffer, data
         * @param {Object} options {isNoiseSample: boolean, startProcessingFrom: relative time, id: "00123.ts", startTime: Number, duration: Number};
         * @returns {undefined}
         */
        async bufferArrayBuffer(buffer, options) {
            this.bufferedTSFiles.push(buffer);
            this.bufferedTSFilesMetadata.push(options);
            const currentTime = Date.now();
            this.bufferLastPushTime = currentTime;
            await sleep(this.bufferArrayBufferTimeout);
            if ((currentTime === this.bufferLastPushTime && this.bufferedTSFiles.length >= this.minBufferedTSFilesLimit) ||
                this.bufferedTSFiles.length >= this.maxBufferedTSFilesLimit) {
                    console.info('bufferArr', currentTime, this.bufferedTSFiles.length);
                    this.concatAndProcessBuffer();
            } else if (currentTime === this.bufferLastPushTime) {
                //If not max limit but last push time didn't change, assume at end / near end.
                await sleep(this.bufferArrayBufferSecondTimeout);
                //If really near the end
                if (currentTime === this.bufferLastPushTime) {
                    console.info('timeout bufferArr', currentTime, this.bufferedTSFiles.length);
                    this.concatAndProcessBuffer();
                }
            }
        }

        /**
         * Concat and process buffer
         */
        concatAndProcessBuffer() {
            //TODO: PADDING OF Uint8Arrays to be 128 aligned, and update time. 
            this.decodeAudioData(concatUint8Arrays(this.bufferedTSFiles), this.bufferedTSFilesMetadata);
            this.bufferedTSFiles = [];
            this.bufferedTSFilesMetadata = [];
        }

        /**
         * Process the decoded buffer in a webworklet
         * @param {ArrayBuffer} compiledBuffer array buffer, data
         * @param {Array.Object} optionsArray Array of {isNoiseSample: boolean, startProcessingFrom: relative time, id: "00123.ts", startTime: Number, duration: Number};
         * @returns {undefined}
         */
        async postDecodeAudioData(compiledBuffer, optionsArray) {
            if (compiledBuffer.length <= 0) console.error("compiledBuffer length 0");
            const offlineCtx = new OfflineAudioContext(compiledBuffer.numberOfChannels, compiledBuffer.length, compiledBuffer.sampleRate);
            // Loads module script via AudioWorklet.
            await offlineCtx.audioWorklet.addModule(chrome.extension.getURL("/panopto/js/jsmpeg/vad-audio-worklet-processor.js"));
            const source = offlineCtx.createBufferSource();
            const processor = new AudioWorkletNode(offlineCtx, 'vad-audio-worklet-processor');
            //Join everything like lego
            source.buffer = compiledBuffer;
            source.connect(processor);
            processor.connect(offlineCtx.destination);

            let cleanUp = function() {
                source.disconnect();
                source.buffer = undefined;
                processor.disconnect();
                prossor.port.onmessage = undefined;
            };
            //Start processing the offline context
            //await offlineCtx.startRendering();
            //On receiving results from processor, process results
            processor.port.onmessage = ((event) => {
                if (event.data) {
                    switch (event.data.msgEnum) {
                        case TSTracker.MessageEnums.NORMAL_RESULTS:
                            //After merging, the start times are at their approprate locations
                            event.data.data.results.forEach(result => {
                                this.insertSilentSections(result.metadata.id, result.data);
                            });
                            cleanUp();
                            break;
                        case TSTracker.MessageEnums.RAW_DATA_RESULTS: 
                            //for debugging purposes generally
                            //console.log(event.data.data);
                            //let threshold = this.calculateThreshold(event.data.data);
                            //let silentSections = this.processSilentSections(startTime, event.data.data, threshold);
                            this.logDataForR(startTime, event.data.data);
                            //console.log(silentSections);
                            //this.insertSilentSections(id, silentSections);
                            break;
                        case TSTracker.MessageEnums.NOISE_RESULTS: 
                            console.info("TSTracker NOISE RES: ", event.data.data);
                            if (!event.data.data || !event.data.data.results) throw new Error("Invalid noise reference line features");
                            this.noiseReferenceLineFeatures = event.data.data.results;
                            this.noiseReferenceCallbacks.fire();
                            this.noiseReferenceCallbacks.empty();
                            cleanUp();
                            break;
                        case TSTracker.MessageEnums.INITIALIZATION_SUCCESS:       
                            console.log("TSTracker INIT SUCCESS: ");
                            console.log(event.data.data);
                            //Start source
                            source.start(0);
                            offlineCtx.startRendering().then((buffer) => {
                                //Once finished, request results from processor
                                processor.port.postMessage({msgEnum: TSTracker.MessageEnums.REQUEST_RESULTS});
                            }).catch((err) => {
                                console.error("TSTracker offlineCtx.startRendering", err);
                            });
                            break;
                        case TSTracker.MessageEnums.DEBUG: 
                            console.log("TSTracker DEBUG: ");
                            console.log(event.data.data);
                            //debugger;
                            break;
                        case TSTracker.MessageEnums.DEBUG_HISTOGRAM:
                            break;
                        case TSTracker.MessageEnums.ERROR:
                            debugger;
                            break;
                    }
                } else {
                    console.warn("TSTracker processor returns undefined results");
                }
            }).bind(this);
            //Begin initialization process
            processor.port.postMessage({msgEnum: 0, data: {noiseReferenceLineFeatures: this.noiseReferenceLineFeatures, sampleRate: compiledBuffer.sampleRate, optionsArray: optionsArray} });
        }
        
        /**
         * Used to generate csv data for processing later in R.
         * @param {Number} startTime Starting time of the TS file
         * @param {Array} data {results: Array of distances, interval: Interval between each calculated distance}
         */
        logDataForR(startTime, data) {
            for (let i = 0; i < data.results.length; i++) {
                this.timeArr.push(+(startTime * data.interval * i).toFixed(1));
            }
            this.distanceArr = this.distanceArr.concat(data.results);
            if (this.timeArr.length > 30000) {
                var dataCSV = "time,dist\n";
                for (let i = 0; i < this.timeArr.length; i++) {
                    dataCSV += `${this.timeArr[i]},${this.distanceArr[i]}\n`;
                }
                /* R commands
                myData <- read.csv(file="D:/Study/Y1 Summer/Panopto Project/Others/Webcast R analysis/2.csv", header=TRUE, sep=",")
                hist(myData$dist, breaks=1000)
                par(pch=22, col="red");heading = paste("type=","h");plot(myData$time, myData$dist, type="n", main=heading);lines(myData$time, myData$dist, type="h") 
                */
                debugger;
                return dataCSV;//Only return something so they don't garbage collect my dataCSV
            }
        }

        /**
         * Take the results from the webworklet and insert into the video as cues
         * @param {String} id relurl of the ts file being retrieved
         * @param {Number} startTime start time of the TS file
         * @param {Object} results array, [isSpeaking: true=was not speaking then started,false=was speaking then stopped, time: currentTime relative to start of TS file]
         * @returns {undefined}
         */
        insertSilentSections(id, data) {
            //data.forEach(x => x.time += startTime);
            //Todo: cache
            SilenceCueManager.addToCache(id, data);
            SilenceCueManager.addSilenceCues(id, data);
        }
    }

    /**
     * An enumeration of various message types that can be sent between the main thread and the audio worklet.
     * @enum {Object}
     */
    TSTracker.MessageEnums = {
        INITIALIZATION_PARAMS: 0,
        INITIALIZATION_SUCCESS: 1,
        NOISE_RESULTS: 2,
        NORMAL_RESULTS: 3,
        REQUEST_RESULTS: 4,
        DEBUG: 5,
        DEBUG_HISTOGRAM: 6,
        RAW_DATA_RESULTS: 7,
        ERROR: 8
    };

    return TSTracker;
})();