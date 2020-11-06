/**
 * AudioCompressor improves sound quality by "lowers the volume of the loudest parts of the signal and raises the volume of the softest parts"
 * see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor
 * 
 */
let AudioCompressor = (() => {
    class AudioCompressor {
        /**
         * AudioCompressor improves sound quality by "lowers the volume of the loudest parts of the signal and raises the volume of the softest parts"
         * 
         * @param {AudioContext} audioContext AudioContext attached to the media element
         * @param {AudioNode} currentSource current source to attach filter to
         * @returns returns new currentSource
         */
        static linkToAudioContextThenReturnTail(audioContext, currentSource) {
            let compressor = audioContext.createDynamicsCompressor();
            //Setup Compressor
            compressor.threshold.value = -50;
            compressor.knee.value = 40;
            compressor.ratio.value = 12;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;

            //Link the pieces together
            currentSource.connect(compressor);

            return compressor;
        }
    }
    return AudioCompressor;
})();