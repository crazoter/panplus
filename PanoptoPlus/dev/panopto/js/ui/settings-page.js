/** @jsx preact.h */

/**
 * How to modify the settings-page.js? 
 * 1. Modify this file
 * 2. Throw this into a Babel compiler https://babeljs.io/repl
 * 3. Paste output to settings-page.js
 */
let SettingsPage = (() => {
  const SAVE_WEBCAST_ONLY = 0;
  const SAVE_FOR_MODULE = 1;
  const SAVE_FOR_ALL = 2;
  const CLEAR_CACHE = 3;
  const CONFIRM_MESSAGES = ["Save these settings for this webcast only?", "Save these settings for all webcasts under this module? (Overrides ALL existing settings under this module)", "Save these settings for all webcasts? (Overrides ALL existing settings)", "Clear the cache? (Only select this if there are issues with the cache)"];
  const PREFIXES = [Cache.GLOBAL_SETTINGS_ID, Cache.MODULE_SETTINGS_PREFIX, Cache.WEBCAST_SETTINGS_PREFIX];
  const zValuePercentages = [50.000, 50.399, 50.798, 51.197, 51.595, 51.994, 52.392, 52.790, 53.188, 53.586, 53.983, 54.380, 54.776, 55.172, 55.567, 55.962, 56.356, 56.749, 57.142, 57.535, 57.926, 58.317, 58.706, 59.095, 59.483, 59.871, 60.257, 60.642, 61.026, 61.409, 61.791, 62.172, 62.552, 62.930, 63.307, 63.683, 64.058, 64.431, 64.803, 65.173, 65.542, 65.910, 66.276, 66.640, 67.003, 67.364, 67.724, 68.082, 68.439, 68.793, 69.146, 69.497, 69.847, 70.194, 70.540, 70.884, 71.226, 71.566, 71.904, 72.240, 72.575, 72.907, 73.237, 73.565, 73.891, 74.215, 74.537, 74.857, 75.175, 75.490, 75.804, 76.115, 76.424, 76.730, 77.035, 77.337, 77.637, 77.935, 78.230, 78.524, 78.814, 79.103, 79.389, 79.673, 79.955, 80.234, 80.511, 80.785, 81.057, 81.327, 81.594, 81.859, 82.121, 82.381, 82.639, 82.894, 83.147, 83.398, 83.646, 83.891, 84.134, 84.375, 84.614, 84.849, 85.083, 85.314, 85.543, 85.769, 85.993, 86.214, 86.433, 86.650, 86.864, 87.076, 87.286, 87.493, 87.698, 87.900, 88.100, 88.298, 88.493, 88.686, 88.877, 89.065, 89.251, 89.435, 89.617, 89.796, 89.973, 90.147, 90.320, 90.490, 90.658, 90.824, 90.988, 91.149, 91.309, 91.466, 91.621, 91.774, 91.924, 92.073, 92.220, 92.364, 92.507, 92.647, 92.785, 92.922, 93.056, 93.189, 93.319, 93.448, 93.574, 93.699, 93.822, 93.943, 94.062, 94.179, 94.295, 94.408, 94.520, 94.630, 94.738, 94.845, 94.950, 95.053, 95.154, 95.254, 95.352, 95.449, 95.543, 95.637, 95.728, 95.818, 95.907, 95.994, 96.080, 96.164, 96.246, 96.327, 96.407, 96.485, 96.562, 96.638, 96.712, 96.784, 96.856, 96.926, 96.995, 97.062, 97.128, 97.193, 97.257, 97.320, 97.381, 97.441, 97.500, 97.558, 97.615, 97.670, 97.725, 97.778, 97.831, 97.882, 97.932, 97.982, 98.030, 98.077, 98.124, 98.169, 98.214, 98.257, 98.300, 98.341, 98.382, 98.422, 98.461, 98.500, 98.537, 98.574, 98.610, 98.645, 98.679, 98.713, 98.745, 98.778, 98.809, 98.840, 98.870, 98.899, 98.928, 98.956, 98.983, 99.010, 99.036, 99.061, 99.086, 99.111, 99.134, 99.158, 99.180, 99.202, 99.224, 99.245, 99.266, 99.286, 99.305, 99.324, 99.343, 99.361, 99.379, 99.396, 99.413, 99.430, 99.446, 99.461, 99.477, 99.492, 99.506, 99.520, 99.534, 99.547, 99.560, 99.573, 99.585, 99.598, 99.609, 99.621, 99.632, 99.643, 99.653, 99.664, 99.674, 99.683, 99.693, 99.702, 99.711, 99.720, 99.728, 99.736, 99.744, 99.752, 99.760, 99.767, 99.774, 99.781, 99.788, 99.795, 99.801, 99.807, 99.813, 99.819, 99.825, 99.831, 99.836, 99.841, 99.846, 99.851, 99.856, 99.861, 99.865, 99.869, 99.874, 99.878, 99.882, 99.886, 99.889, 99.893, 99.896, 99.900, 99.903, 99.906, 99.910, 99.913, 99.916, 99.918, 99.921, 99.924, 99.926, 99.929, 99.931, 99.934, 99.936, 99.938, 99.940, 99.942, 99.944, 99.946, 99.948, 99.950, 99.952, 99.953, 99.955, 99.957, 99.958, 99.960, 99.961, 99.962, 99.964, 99.965, 99.966, 99.968, 99.969, 99.970, 99.971, 99.972, 99.973, 99.974, 99.975, 99.976, 99.977, 99.978, 99.978, 99.979, 99.980, 99.981, 99.981, 99.982, 99.983, 99.983, 99.984, 99.985, 99.985, 99.986, 99.986, 99.987, 99.987, 99.988, 99.988, 99.989, 99.989, 99.990, 99.990, 99.990, 99.991, 99.991, 99.992, 99.992, 99.992, 99.992, 99.993, 99.993, 99.993, 99.994, 99.994, 99.994, 99.994, 99.995, 99.995, 99.995, 99.995, 99.995, 99.996, 99.996, 99.996, 99.996, 99.996, 99.996, 99.997, 99.997];

  class SettingsPage extends preact.Component {
    /**
     * A setting is changed
     * @param {Event} event event triggered (onChange event)
     */
    settingsChange(event) {
      if (event.target.name == "settings_playbackoptions") {
        this.saveSettingsWithoutCaching();
        App.speedSlider.updateOptions();
      } else if (event.target.name == "settings_carouseldesign") {
        this.saveSettingsWithoutCaching();
        App.carouselManager.updateDesign();
        let ctxBridge = new ContextBridge(() => $(window).trigger('resize'));
        ctxBridge.exec();
      } else if (event.target.name == "settings_subtitles") {
        this.saveSettingsWithoutCaching();
        App.transcriptDisplay.updateVisibility();
      }

      console.log(event); //Re-render

      this.setState({});
    }

    saveSettingsWithoutCaching() {
      let form = document.getElementById("settings-form");
      let settingsData = $(form).serializeArray();
      settingsData.push({
        name: "time",
        value: new Date().getTime()
      });
      Settings.setData(settingsData);
    }
    /**
     * Save settings button pressed, save settings
     * @param {Number} index Index of what kind of saving it is (refer to constants)
     */


    saveSettings(index) {
      let form = document.getElementById("settings-form");

      if (form.checkValidity()) {
        if (confirm(CONFIRM_MESSAGES[index])) {
          if (index == CLEAR_CACHE) {
            Cache.invalidateCache().then(() => {
              $.notify("Cache Cleared!", {
                className: "success",
                position: "bottom left"
              });
            });
          } else {
            //Example data
            //"[{"name":"settings_sidebar","value":"1"},{"name":"settings_opentab","value":"0"},{"name":"settings_carouselshown","value":"1"},{"name":"settings_initialspeed","value":"1"},{"name":"settings_playbackoptions","value":"0"},{"name":"settings_carouseldesign","value":"0"},{"name":"settings_subtitles","value":"1"},{"name":"settings_machinetranscript","value":"1"},{"name":"settings_silencetrimming","value":"1"},{"name":"settings_silencethreshold","value":"2"}]"
            //Save current data
            let settingsData = $(form).serializeArray();
            settingsData.push({
              name: "time",
              value: new Date().getTime()
            });
            Settings.setData(settingsData); //Get cleaned up data

            settingsData = Settings.getData();
            let promise = null;

            switch (index) {
              case SAVE_WEBCAST_ONLY:
                promise = Cache.save(`${PREFIXES[2]}${getWebcastId()}`, settingsData, Cache.WEBCAST_SETTINGS_EXPIRY_OFFSET_DAYS);
                break;

              case SAVE_FOR_MODULE:
                promise = Cache.save(`${PREFIXES[1]}${getModuleId()}`, settingsData, Cache.MODULE_SETTINGS_EXPIRY_OFFSET_DAYS);
                break;

              case SAVE_FOR_ALL:
                promise = Cache.save(`${PREFIXES[0]}`, settingsData, Cache.GLOBAL_SETTINGS_EXPIRY_OFFSET_DAYS);
                break;
            }

            promise.then(() => {
              $.notify("Settings Saved!", {
                className: "success",
                position: "bottom left"
              });
            });
          }
        }
      } else {
        $.notify("Some fields are invalid (all fields must be filled).", {
          className: "error",
          position: "bottom left"
        });
      }
    }
    /**
     * Make Panopto fullscreen
     */


    fullScreen() {
      document.body.requestFullscreen();
      $.notify("You can also go fullscreen by pressing F11.", {
        className: "info",
        position: "bottom left"
      });
    }
    /**
     * After component mounted, set form values
     * https://preactjs.com/guide/api-reference
     */


    componentDidMount() {
      //Populate data from Settings data
      let form = document.getElementById("settings-form");
      let settingsData = Settings.getData();

      for (let i = 0; i < settingsData.length; i++) {
        if (form.elements[settingsData[i].name]) form.elements[settingsData[i].name].value = settingsData[i].value;
      } //Re-render


      this.setState({});
    } //Note: only numbers used as values and they will be parsed as Int later on


    render({}, {}) {
      let index = null;
      let form = document.getElementById("settings-form");

      if (form) {
        let value = form.elements["settings_silencethreshold"].value;
        index = Math.round(parseFloat(value) * 100);
      }

      let zValuePercentage = (zValuePercentages[index] || "Invalid") + "%";
      return preact.h("form", {
        id: "settings-form"
      }, preact.h("h4", null, "On Startup"), preact.h("div", null, "Sidebar"), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_sidebar",
        value: "1"
      }), preact.h("i", null, "Expanded")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_sidebar",
        value: "0"
      }), preact.h("i", null, "Collapsed"))), preact.h("div", null, "Selected Tab", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "The tab that is selected when you open a webcast.")))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_opentab",
        value: "0"
      }), preact.h("i", null, "2nd Screen")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_opentab",
        value: "1"
      }), preact.h("i", null, "Transcript"))), preact.h("div", null, "Carousel", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "Carousel refers to the clickable \"snapshots\" below the webcast.")))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_carouselshown",
        value: "1"
      }), preact.h("i", null, "Shown")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_carouselshown",
        value: "0"
      }), preact.h("i", null, "Hidden"))), preact.h("div", null, "Initial Playback Speed", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "This determines the initial playback speed when you start the webcast.")))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("input", {
        type: "number",
        name: "settings_initialspeed",
        step: "0.1",
        min: "0.5",
        max: "5",
        required: true
      })), preact.h("hr", null), preact.h("h4", null, "Theme"), preact.h("div", null, "Playback Options", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "You can now customize how you want your playback options to look like. Try changing them and see which one you prefer!")))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_playbackoptions",
        value: "0"
      }), preact.h("i", null, "Default")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_playbackoptions",
        value: "1"
      }), preact.h("i", null, "More Buttons")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_playbackoptions",
        value: "2"
      }), preact.h("i", null, "Slider"))), preact.h("div", null, "Carousel", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "Carousel refers to the clickable \"snapshots\" below the webcast.")))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_carouseldesign",
        value: "0"
      }), preact.h("i", null, "Default")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_carouseldesign",
        value: "1"
      }), preact.h("i", null, "Smaller"))), preact.h("div", null, "Subtitles"), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_subtitles",
        value: "1"
      }), preact.h("i", null, "Shown")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_subtitles",
        value: "0"
      }), preact.h("i", null, "Hidden"))), preact.h("hr", null), preact.h("h4", {
        style: "display: inline-block;"
      }, "Features"), preact.h("span", null, " (Changes after restarting)"), preact.h("div", null, "Machine Transcription", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "This feature refers to the transcripts and subtitles. Disable it and refresh the page if there are issues.")))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_machinetranscript",
        value: "1"
      }), preact.h("i", null, "Enabled")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_machinetranscript",
        value: "0"
      }), preact.h("i", null, "Disabled"))), preact.h("div", null, "Silence Trimming", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "This feature refers to the skipping of sections where the presenter is not speaking.")))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_silencetrimming",
        value: "1"
      }), preact.h("i", null, "Enabled")), preact.h("label", {
        class: "settings-checkbox"
      }, preact.h("input", {
        type: "radio",
        required: true,
        name: "settings_silencetrimming",
        value: "0"
      }), preact.h("i", null, "Disabled"))), preact.h("div", null, "Silence z-value", preact.h("div", {
        class: "tool-tip"
      }, preact.h("i", {
        class: "tool-tip__icon"
      }, "i"), preact.h("p", {
        class: "tool-tip__info"
      }, preact.h("span", {
        class: "info"
      }, "Reduce this value if speech is being skipped and increase it if too little silence/noise is being skipped.", preact.h("table", {
        class: "silence-table"
      }, preact.h("tr", null, preact.h("th", null, "Scenario"), preact.h("th", null, "Suggested action or value")), preact.h("tr", null, preact.h("td", null, "Only speech is being removed"), preact.h("td", null, "Disable feature or try value 0.67")), preact.h("tr", null, preact.h("td", null, "Silence and speech being removed"), preact.h("td", null, "Reduce value, try 1.48")), preact.h("tr", null, preact.h("td", null, "Default value"), preact.h("td", null, "1.89")), preact.h("tr", null, preact.h("td", null, "Noise not removed"), preact.h("td", null, "Increase value, try 2.37"))))))), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("input", {
        type: "number",
        name: "settings_silencethreshold",
        min: "0",
        max: "3.99",
        step: "0.01",
        required: true
      }), preact.h("div", null, zValuePercentage, " confidence interval")), preact.h("div", {
        onClick: this.fullScreen,
        class: "ui-state-default ui-button save-btns"
      }, preact.h("a", {
        href: "#",
        class: "ui-tabs-text-lookalike"
      }, preact.h("span", null, "Make Panopto Full-screen"))), preact.h("hr", null), preact.h("h4", null, "Bug Report"), preact.h("div", null, preact.h("a", {
        href: "https://github.com/crazoter/panplus/issues",
        target: "_blank"
      }, "Report a bug via GitHub")), preact.h("br", null), preact.h("hr", null), preact.h("div", {
        onClick: this.saveSettings.bind(this, SAVE_WEBCAST_ONLY),
        class: "ui-state-default ui-button save-btns"
      }, preact.h("a", {
        href: "#",
        class: "ui-tabs-text-lookalike"
      }, preact.h("span", null, "Save for this webcast only"))), preact.h("div", {
        onClick: this.saveSettings.bind(this, SAVE_FOR_MODULE),
        class: "ui-state-default ui-button save-btns"
      }, preact.h("a", {
        href: "#",
        class: "ui-tabs-text-lookalike"
      }, preact.h("span", null, "Save for all webcasts under this module"))), preact.h("div", {
        onClick: this.saveSettings.bind(this, SAVE_FOR_ALL),
        class: "ui-state-default ui-button save-btns"
      }, preact.h("a", {
        href: "#",
        class: "ui-tabs-text-lookalike"
      }, preact.h("span", null, "Save for all webcasts"))), preact.h("div", {
        onClick: this.saveSettings.bind(this, CLEAR_CACHE),
        class: "ui-state-default ui-button save-btns"
      }, preact.h("a", {
        href: "#",
        class: "ui-tabs-text-lookalike"
      }, preact.h("span", null, "Clear Cache"))));
    }

  }

  return SettingsPage;
})();
/**
Settings
On Startup
Sidebar: Collapsed / Hidden
Opened Tab: 2nd Screen / Transcript
Carousel: Shown / Hidden
Initial Playback Speed: 1.5x
Volume Boosted: Disabled / Enabled
Volume Boost Multiplier: 3.0

Theme
Playback Options: Slider / More Buttons / Default
Carousel: Smaller / Default
Subtitles: Shown / Hidden

Features (Changing will require restarting)
Machine Transcription: Enabled / Disabled
Silence Removal: Enabled / Disabled
Silence Removal Threshold (default 2.3, higher for looser definition of what is noise): 2.3

Save for this webcast only
Save for all webcasts under this module
Save for all webcasts
 */