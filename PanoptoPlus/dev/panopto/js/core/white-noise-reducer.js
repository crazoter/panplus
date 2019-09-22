/**
     * WhiteNoiseReducer reduces white noise by adding a bandpass filter and compression.
     */
let WhiteNoiseReducer = (() => {
    class WhiteNoiseReducer {
        /**
         * Modifications to the noise https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
         * @param {DOM} mediaElem MediaElement (video) which will have its audio modified
         * @returns Object containing the compressor and filter
         */
        /**
         * Adding a bandpass filter to the sound to reduce white noise https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
         * 
         * @param {AudioContext} audioContext AudioContext attached to the media element
         * @param {AudioNode} currentSource current source to attach filter to
         * @returns returns new currentSource
         */
        static linkToAudioContextThenReturnTail(audioContext, currentSource) {
            let compressor = audioContext.createDynamicsCompressor(),
                filter = audioContext.createBiquadFilter();
            //Setup Compressor
            compressor.threshold.value = -50;
            compressor.knee.value = 40;
            compressor.ratio.value = 12;
            //https://github.com/GoogleChromeLabs/web-audio-samples/wiki/DynamicsCompressor.reduction
            //Value is read-only so this section is commented out
            /*
            if (typeof compressor.reduction === 'number' 
                || typeof compressor.reduction === 'float') {
                compressor.reduction = -20;
            } else {
                compressor.reduction.value = -20;
            }*/
            compressor.attack.value = 0;
            compressor.release.value = 0.25;

            //Setup Filter
            filter.Q.value = 1.80;
            filter.frequency.value = 355;
            filter.gain.value = 25;
            filter.type = 'bandpass';
            filter.connect(compressor);

            //Link the pieces together
            currentSource.connect(filter);

            return compressor;
        }
    }
    return WhiteNoiseReducer;
})();