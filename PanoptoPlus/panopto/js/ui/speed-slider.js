function SpeedSlider () {
    this.init = function() {
        //Get template
        Template.get('speed-slider.html').then((template) => {
            //Hide all elements except the first and last element for the speed adjuster
            //WARNING: do not remove or it may cause a race condition
            $("#playSpeedExpander").children().not(":first, :last").hide();
            //Add template to after the header div
            $("#playSpeedExpander div.flyout-header").after(template);
            //Initialize Slider
            $("#speed-slider").slider({
                min: 0.5, 
                max: 5, 
                value: 1, 
                step: 0.1,
                slide: function(event, ui) {
                    $("video").each((index, video) => (video.playbackRate = ui.value));
                    $("#playSpeedMultiplier").text(ui.value+"x");
                },
                change: function(event, ui) {
                    $("video").each((index, video) => (video.playbackRate = ui.value));
                    $("#playSpeedMultiplier").text(ui.value+"x");
                },
            })
            .slider('pips', {step: 1, rest: "label", suffix: "x"})
            .slider("float");
        });
    }
}