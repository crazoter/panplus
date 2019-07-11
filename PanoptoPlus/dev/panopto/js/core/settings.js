/**
 * @file Settings Class
 */

 /**
  * @class Settings Class
  */

let Settings = (() => {
    let data = [];
    let dataObject = undefined;
    class Settings {
        /**
         * Constructor is empty
         */
        constructor() {}

        /**
         * Get default data if not found in cache
         * @returns default data
         */
        static initializeDefaults() {
            let data = [{"name":"settings_sidebar","value":1},{"name":"settings_opentab","value":0},{"name":"settings_carouselshown","value":1},{"name":"settings_initialspeed","value":1},{"name":"settings_playbackoptions","value":2},{"name":"settings_carouseldesign","value":1},{"name":"settings_subtitles","value":1},{"name":"settings_machinetranscript","value":1},{"name":"settings_silencetrimming","value":1},{"name":"settings_silencethreshold","value":2.37}];
            data.push({name: "time", value: new Date().getTime()});
            return data;
        }

        /**
         * Initialize
         */
        static async init() {
            //Assuming that cache is already prepared
            data = await Cache.loadSettings();
            if (data == null) {
                data = Settings.initializeDefaults();
            }
            this.updateDataObject();
        }

        /**
         * Convert settings data (which is in formdata format) to object format
         */
        static updateDataObject() {
            dataObject = {};
            data.forEach((nameValuePair) => {
                dataObject[nameValuePair.name] = nameValuePair.value;
            });
        }
        static getData() { return data; }
        static setData(d) {
            data = d;
            for (let i = 0; i < data.length; i++) {
                let floatVal = parseFloat(data[i].value);
                if (!isNaN(floatVal)) {
                    data[i].value = floatVal;
                }
            }
            this.updateDataObject();
        }
        static getDataAsObject() { return dataObject; }
    }

    Settings.keys = {sidebar: "settings_sidebar", opentab: "settings_opentab", carouselshown: "settings_carouselshown", initialspeed: "settings_initialspeed", playbackoptions: "settings_playbackoptions", carouseldesign: "settings_carouseldesign", subtitles: "settings_subtitles", machinetranscript: "settings_machinetranscript", silencetrimming: "settings_silencetrimming", silencethreshold: "settings_silencethreshold" };
    Settings.PLAYBACK_OPTIONS = {
        DEFAULT: 0,
        MORE_BUTTONS: 1,
        SLIDER: 2,
    };
    Settings.CAROUSEL_DESIGNS = {
        DEFAULT: 0,
        SMALLER: 1,
    }


    return Settings;
})();