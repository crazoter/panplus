/**
 * @file VolumeBooster, includes code that will modify the volume node to include a volume booster (gain modifier)
 */
let VolumeBooster = (() => {
    let gains = [];
    /**
     * VolumeBooster, includes code that will modify the volume node to include a volume booster (gain modifier)
     */
    class VolumeBooster {
        /**
         * Initializes mainVideoIndex and initialize based on settings
         * @param {Object} settings settings object
         */
        constructor() {
            this.init();
        }

         /**
         * Init: initialize volume booster. First grabs slider template, then initializes.
         * @returns {undefined}
         */
        init() {
            VideosLoadedEvent.subscribe(() => {
                //Setup prior to video autoplay causes issues
                //this.setup();
                //let self = this;
                //Get template
                Template.get('volume-booster.html').then((template) => {
                    $("#volumeFlyout").append(template);
                    $('#vol-boost-gain').on('input', () => {
                        let gain = parseFloat($('#vol-boost-gain').val());
                        if (!isNaN(gain)) {
                            gains.forEach((gainNode) => {
                                gainNode.gain.value = gain;
                            });
                        }
                    });
                    $('#vol-boost-gain').keydown((event) => {
                        event.stopPropagation();
                    }).keyup((event) => {
                        event.stopPropagation();
                    });
                    //Todo: verify code unneeded
                    /*
                    //Add volume booster
                    $("#volumeFlyout").append(template);
                    //Initialize enable button to reveal on enable
                    $("#vol-boost-btn-enable").click(() => {
                        //Hide and show stuff
                        $("#vol-boost-btn-enable").hide();
                        $("#vol-boost-disclaimer").hide();
                        $("#vol-boost-gain").prop('disabled', false);
                        //$("#vol-boost-ui-container").show();
                        //Change gain on value change
                        $('#vol-boost-gain').on('input', () => {
                            let gain = parseFloat($('#vol-boost-gain').val());
                            if (!isNaN(gain)) {
                                gains.forEach((gainNode) => {
                                    gainNode.gain.value = gain;
                                });
                            }
                        });
                        $('#vol-boost-gain').keydown((event) => {
                            event.stopPropagation();
                        }).keyup((event) => {
                            event.stopPropagation();
                        });
                    });*/
                });
            });
        }

        /**
         * Modify gain to push volume beyond max https://stackoverflow.com/questions/46264417/videojs-html5-video-js-how-to-boost-volume-above-maximum
         * Todo: Abstract this to another class
         * @param {DOM} mediaElem MediaElement (video) which will have its gain modified
         * @returns gain 
         */
        linkToAudioContextThenReturnTail(audioContext, currentSource) {
            let gainNode = audioContext.createGain();
            gains.push(gainNode);
            currentSource.connect(gainNode);
            gainNode.gain.value = 1;
            return gainNode;
        }
    }
    return VolumeBooster;
})();