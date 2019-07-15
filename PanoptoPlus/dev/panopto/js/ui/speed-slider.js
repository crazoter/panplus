/**
 * @file SpeedSlider, includes code that will load jQuery slider to modify the playback speed into a slider (instead of buttons) and provide larger range.
 */
let SpeedSlider = (() => {
    /**
     * SpeedSlider, includes code that will load jQuery slider to modify the playback speed into a slider (instead of buttons) and provide larger range.
     */
    class SpeedSlider {
        /**
         * Initialize with regards to settings
         * @param {Object} settings Settings object
         */
        constructor(settings) {
            //Initialize everything and show that which we want
            Promise.all([this.initMoreButtons(), this.initSlider(), this.setInitialPlaybackSpeed()]). then(() => {
                this.updateOptions();
            })
        }

        /**
         * Hide everything
         */
        hideAllOptions() {
            //Hide buttons and slider
            $("#playSpeedExpander .accented-tab, .speed-slider-padding, .scale-slider").hide();
        }

        /**
         * Init more buttons
         */
        initMoreButtons() {
            return new Promise((resolve) => {
                VideosLoadedEvent.subscribe(() => {
                    //Remove highlight if anything else is clicked
                    $("#playSpeedExpander .accented-tab").click((e) => {
                        $("#playSpeedExpander .accented-tab.extra.selected").removeClass("selected");
                    });
                    //Create new buttons with click logic 
                    for (let i = 3; i > 2; i -= 0.25) {
                        let child = $(`<div class="play-speed accented-tab fast fastest extra hidden" tabindex="0" role="menuitemradio" value="${i}" aria-checked="false">${i}x</div>`).insertAfter("#Fastest");
                        $(child).click((e) => {
                            let $child = $(e.target);
                            $("#playSpeedExpander .accented-tab.selected").removeClass("selected");
                            $child.addClass("selected");
                            this.changePlaybackSpeed(parseFloat($child.attr('value')));
                            $("#playSpeedExpander .flyout-close.transport-button").click();
                        });
                    }

                    //Update slider on click
                    $("#playSpeedExpander .accented-tab").click((e) => {
                        let spd = parseFloat(e.currentTarget.innerText);
                        $("#speed-slider").slider('value', spd);
                    });

                    resolve();
                });
            });
        }

         /**
         * Init: initialize speed slider. First grabs slider template, then initializes.
         * @returns {undefined}
         */
        initSlider() {
            return new Promise((resolve) => {
                let self = this;
                let changePlaybackRate = function(event, ui) {
                    self.changePlaybackSpeed(ui.value);
                }
                //Get template
                Template.get('speed-slider.html').then((template) => {
                    //Hide all elements except the first and last element for the speed adjuster
                    //WARNING: do not remove or it may cause a race condition
                    //$("#playSpeedExpander").children().not(":first, :last").hide();//This has been replaced with a CSS implementation
                    //Add template to after the header div
                    $("#playSpeedExpander div.flyout-header").after(template);
                    //Initialize Slider
                    $("#speed-slider").slider({
                        min: 0.5, 
                        max: 5, 
                        value: 1, 
                        step: 0.1,
                        slide: changePlaybackRate,
                        change: changePlaybackRate,
                    })
                    .slider('pips', {step: 1, rest: "label", suffix: "x"})
                    .slider("float");

                    resolve();
                });
            });
        }

        /**
         * Change design as required based on settings
         */
        updateOptions() {
            this.hideAllOptions();
            switch (Settings.getDataAsObject()[Settings.keys.playbackoptions]) {
                case Settings.PLAYBACK_OPTIONS.MORE_BUTTONS:
                    $("#playSpeedExpander .accented-tab").show();
                    break;
                case Settings.PLAYBACK_OPTIONS.DEFAULT:
                    $("#playSpeedExpander .accented-tab").show();
                    $("#playSpeedExpander .accented-tab.extra").hide();
                    break;
                case Settings.PLAYBACK_OPTIONS.SLIDER:
                    $(".speed-slider-padding, .scale-slider").show();
                    break;
            }
        }

        /**Initialize with settings */
        setInitialPlaybackSpeed() {
            return new Promise((resolve) => {
                //Settings
                VideosLoadedEvent.subscribe(() => {
                    let spd = Settings.getDataAsObject()[Settings.keys.initialspeed];
                    this.changePlaybackSpeed(spd);
                    $("#speed-slider").slider('value', spd);
                    resolve();
                });
            });
        }

        /**
         * Change playback speed to multiplier
         * @param {Number} value Multiplier
         */
        changePlaybackSpeed(value) {
            $("video").each((index, video) => (video.playbackRate = value));
            $("#playSpeedMultiplier").text(value+"x");
        }
    }
    return SpeedSlider;
})();