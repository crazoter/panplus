/**
 * @file VolumeBooster, includes code that will modify the volume node to include a volume booster (gain modifier)
 */
let VolumeBooster = (() => {
    let audioContexts = [];
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
                let self = this;
                //Get template
                Template.get('volume-booster.html').then((template) => {
                    //Add volume booster
                    $("#volumeFlyout").append(template);
                    //Initialize enable button to reveal on enable
                    $("#vol-boost-btn-enable").click(() => {
                        self.setup();
                        //Hide and show stuff
                        $("#vol-boost-btn-enable").hide();
                        $("#vol-boost-disclaimer").hide();
                        $("#vol-boost-gain").prop('disabled', false);
                        //$("#vol-boost-ui-container").show();
                        //Change gain on value change
                        $('#vol-boost-gain').on('input', () => {
                            let gain = parseFloat($('#vol-boost-gain').val());
                            if (!isNaN(gain)) {
                                audioContexts.forEach((x) => {
                                    x.amplify(gain);
                                });
                            }
                        });
                        $('#vol-boost-gain').keydown((event) => {
                            event.stopPropagation();
                        }).keyup((event) => {
                            event.stopPropagation();
                        });
                    });
                });
            });
        }

        /**
         * Setup the audiocontexts, called by init. 
         */
        setup() {
            let doms = document.getElementsByTagName("video");
            for (let i = 0; i < doms.length; i++)
                audioContexts.push(this.prepareAudioContext(doms[i]));
        }

        /**
         * Modify gain to push volume beyond max https://stackoverflow.com/questions/46264417/videojs-html5-video-js-how-to-boost-volume-above-maximum
         * @param {DOM} mediaElem MediaElement (video) which will have its gain modified
         * @returns AudioContext to call .amplify(Number) to modify its gain
         */
        prepareAudioContext(mediaElem) {
            var context = new(window.AudioContext || window.webkitAudioContext),
              result = {
                context: context,
                source: context.createMediaElementSource(mediaElem),
                gain: context.createGain(),
                media: mediaElem,
                amplify: function(multiplier) {
                  result.gain.gain.value = multiplier;
                },
                getAmpLevel: function() {
                  return result.gain.gain.value;
                }
              };
            result.source.connect(result.gain);
            result.gain.connect(context.destination);
            result.amplify(1);
            return result;
          }
    }
    return VolumeBooster;
})();