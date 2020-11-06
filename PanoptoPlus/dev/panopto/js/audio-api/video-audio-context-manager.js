/**
 * Video Audio Context Manager handles linkages of components that use the audio contexts of videos.
 */
let VideoAudioContextManager = (() => {
    let audioContextsWithMetadata = [];

    class VideoAudioContextManager {
        /**
         * Setup the audioContextsWithMetadata upon video load. Then sets up white noise reducer & volume booster.
         * @param {Object} settings settings object
         */
        constructor(settings) {
            VideosLoadedEvent.subscribe(() => {
                let doms = document.getElementsByTagName("video");
                let self = this;
                let volumeBooster = new VolumeBooster(settings);
                for (let i = 0; i < doms.length; i++) {
                    doms[i].onplay = function() {
                        //Remove listener
                        doms[i].onplay = null;
                        let audioContextWithMetadata = self.prepareAudioContextWithMetadata(doms[i]);
                        audioContextsWithMetadata.push(audioContextWithMetadata);

                        //Gain
                        audioContextWithMetadata.currentSource = 
                            volumeBooster.linkToAudioContextThenReturnTail(
                                    audioContextWithMetadata.context, audioContextWithMetadata.currentSource);

                        //Add white noise
                        if ((settings[Settings.keys.whitenoiseremoval])) {
                            //Filter
                            audioContextWithMetadata.currentSource = 
                                WhiteNoiseReducer.linkToAudioContextThenReturnTail(
                                    audioContextWithMetadata.context, audioContextWithMetadata.currentSource);
                            
                            //Compressor (Using it without filter causes more white noise)
                            audioContextWithMetadata.currentSource = 
                                AudioCompressor.linkToAudioContextThenReturnTail(
                                    audioContextWithMetadata.context, audioContextWithMetadata.currentSource);
                        }

                        //Finish linkages
                        audioContextWithMetadata.currentSource.connect(audioContextWithMetadata.context.destination);
                    };
                }
            });
        }

        /**
         * Modifications to the noise https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
         * @param {DOM} mediaElem MediaElement (video) which will have its audio modified
         * @returns Object containing context, source, media and currentSource.
         */
        prepareAudioContextWithMetadata(mediaElem) {
            var context = new(window.AudioContext || window.webkitAudioContext),
                results = {
                    context: context,
                    source: context.createMediaElementSource(mediaElem),
                    media: mediaElem
                };
            results.currentSource = results.source;
            return results;
        }
    }
    return VideoAudioContextManager;
})();