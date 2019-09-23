/**
 * WhiteNoiseReducer reduces white noise by adding a bandpass filter and compression.
 */
let WhiteNoiseReducer = (() => {
    class WhiteNoiseReducer {
        /**
         * Adding a bandpass filter to the sound to reduce white noise https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
         * 
         * @param {AudioContext} audioContext AudioContext attached to the media element
         * @param {AudioNode} currentSource current source to attach filter to
         * @returns returns new currentSource
         */
        static linkToAudioContextThenReturnTail(audioContext, currentSource) {
            //See https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor
            //See https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
            let compressor = audioContext.createDynamicsCompressor(),
                filter = audioContext.createBiquadFilter();
            //Setup Compressor
            compressor.threshold.value = -50;
            compressor.knee.value = 40;
            compressor.ratio.value = 12;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;

            //Setup Filter
            filter.Q.value = 4;
            filter.frequency.value = 475;
            filter.type = 'bandpass';
            filter.connect(compressor);

            //Link the pieces together
            currentSource.connect(filter);

            return compressor;
        }
    }
    return WhiteNoiseReducer;
})();