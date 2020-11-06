
/**
 * @file Web Worklet to demux, decode and process TS files for silent sections.
 */
//Import scripts
//current directory: root/panopto/js/jsmpeg
importScripts(
	"../../../libs/indutny-fft-js/fft.min.js",
	"./vad-processor.js",
	"./message-enums.js",
);

//Messaging system with TS-Tracker.js
onmessage = (event) => {
	//this.VADWorker.postMessage({data: [channel0, channel1], options: options}, [channel0, channel1]);
	//event.data.data: [ArrayBuffer] arraybuffer array buffer, data
	//event.data.options: {Object} options {isNoiseSample: boolean, startProcessingFrom: relative time, id: "00123.ts", startTime: Number, duration: Number, float32Length: Number, sampleRate: Number};
	const data = event.data.data;
	const options = event.data.options;
	const vadProcessor = new VADProcessor(data, options);
	const results = vadProcessor.process();
	const msgEnum = options.isNoiseSample ? MessageEnums.NOISE_RESULTS : MessageEnums.NORMAL_RESULTS;
	//const msgEnum = MessageEnums.NOISE_RESULTS;
	vadProcessor.cleanUp();
	//Send results back
	postMessage({data: {results: results, interval: vadProcessor.calculateLagTime()}, options: options, msgEnum: msgEnum});
};