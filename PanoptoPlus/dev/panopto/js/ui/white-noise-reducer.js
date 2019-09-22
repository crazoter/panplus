/**
     * WhiteNoiseReducer reduces white noise.
     */
let WhiteNoiseReducer = (() => {
    let audioContexts = [];

    class WhiteNoiseReducer {
        /**
         * Initializes White Noise Reducer upon videos loaded.
         * @param {Object} settings settings object
         */
        constructor(settings) {
            VideosLoadedEvent.subscribe(() => {
                this.setup();
            });
        }

        /**
         * Setup the audiocontexts, called by the constructor. 
         */
        setup() {
            let doms = document.getElementsByTagName("video");
            for (let i = 0; i < doms.length; i++)
                audioContexts.push(this.prepareAudioContext(doms[i]));
        }

        /**
         * Modifications to the noise https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
         * @param {DOM} mediaElem MediaElement (video) which will have its audio modified
         * @returns Object containing the compressor and filter
         */
        prepareAudioContext(mediaElem) {
            var context = new(window.AudioContext || window.webkitAudioContext),
              result = {
                context: context,
                source: context.createMediaElementSource(mediaElem),
                compressor: context.createDynamicsCompressor(),
                filter: context.createBiquadFilter(),
                media: mediaElem
            };
            //Setup Compressor
            result.compressor.threshold.value = -50;
            result.compressor.knee.value = 40;
            result.compressor.ratio.value = 12;
            //https://github.com/GoogleChromeLabs/web-audio-samples/wiki/DynamicsCompressor.reduction
            /*
            if (typeof result.compressor.reduction === 'number' 
                || typeof result.compressor.reduction === 'float') {
                result.compressor.reduction = -20;
            } else {
                result.compressor.reduction.value = -20;
            }*/
            result.compressor.attack.value = 0;
            result.compressor.release.value = 0.25;

            //Setup Filter
            //result.filter.Q.value = 8.30;
            result.filter.Q.value = 1.80;
            result.filter.frequency.value = 355;//355;
            result.filter.gain.value = 25;
            result.filter.type = 'bandpass';
            result.filter.connect(result.compressor);

            //Link the pieces together
            result.source.connect(result.filter);
            result.compressor.connect(context.destination);
            //result.filter.connect(context.destination);

            return result;
        }
    }
    return WhiteNoiseReducer;
})();