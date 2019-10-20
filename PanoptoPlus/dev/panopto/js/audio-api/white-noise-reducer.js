/**
 * WhiteNoiseReducer reduces white noise by adding a bandpass filter and compression.
 */
let WhiteNoiseReducer = (() => {
    class WhiteNoiseReducer {
        /**
         * Adding a bandpass filter to the sound to reduce white noise
         * 
         * @param {AudioContext} audioContext AudioContext attached to the media element
         * @param {AudioNode} currentSource current source to attach filter to
         * @returns returns new currentSource
         */
        static linkToAudioContextThenReturnTail(audioContext, currentSource) {
            //See https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
            let filter = audioContext.createBiquadFilter();

            filter.type = 'highshelf';
            filter.frequency.value = 2500;
            filter.Q.value = 0;
            filter.gain.value = -30;

            //Link the pieces together
            currentSource.connect(filter);

            return filter;
        }
    }
    return WhiteNoiseReducer;
})();