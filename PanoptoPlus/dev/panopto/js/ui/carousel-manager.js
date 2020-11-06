/**
 * @file CarouselManager, manages carousel display and showing/hiding
 */
let CarouselManager = (() => {
    /**
     * CarouselManager, manages carousel display and showing/hiding
     */
    class CarouselManager {
        /**
         * Initializes mainVideoIndex
         */
        constructor(settings) {
            VideosLoadedEvent.subscribe(() => {
                //if the website didn't hide the option to toggle the carousel, likely because the carousel isn't enabled
                if ($("#toggleThumbnailsButton").css('display') != 'none') {
                    this.updateDesign();
                    //Change visibility based on setting
                    if (!settings[Settings.keys.carouselshown]) 
                        this.toggleCarouselDisplay();
                }
            });
        }

        /**
         * Change design based on setting
         */
        updateDesign() {
            switch (Settings.getDataAsObject()[Settings.keys.carouseldesign]) {
                case Settings.CAROUSEL_DESIGNS.DEFAULT:
                    $("ol#thumbnailList.smaller-carousel").removeClass("smaller-carousel");
                    $(".viewer .thumbnail-strip.smaller-carousel").removeClass("smaller-carousel");
                    break;
                case Settings.CAROUSEL_DESIGNS.SMALLER:
                    $("ol#thumbnailList").addClass("smaller-carousel");
                    $(".viewer .thumbnail-strip").addClass("smaller-carousel");
                    break;
            }
        }

        /**
         * Hide Carousel
         */
        hideCarousel() {
            if (this.carouselIsShown()) this.toggleCarouselDisplay();
        }

        /**
         * Show Carousel
         */
        showCarousel() {
            if (!this.carouselIsShown()) this.toggleCarouselDisplay();
        }

        /**
         * Carousel is shown
         * WARNING: THIS DEFAULTS TO FALSE WHEN STARTING UP.
         */
        carouselIsShown() {
            return $("#toggleThumbnailsButton").attr("aria-expanded") == "true" || $("#toggleThumbnailsButton").attr("aria-expanded") == null;
        }

        /**
         * Toggle Carousel Visibility
         */
        toggleCarouselDisplay() {
            $("#toggleThumbnailsButton").click();
        }
    }
    return CarouselManager;
})();