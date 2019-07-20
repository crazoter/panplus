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

      console.log(event);
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
              $.notify("Cache Cleared!", "success");
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
              $.notify("Settings Saved!", "success");
            });
          }
        }
      } else {
        $.notify("Some fields are invalid (all fields must be filled).", "warn");
      }
    }
    /**
     * Make Panopto fullscreen
     */


    fullScreen() {
      document.body.requestFullscreen();
      $.notify("You can also go fullscreen by pressing F11.", "info");
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
      }
    } //Note: only numbers used as values and they will be parsed as Int later on


    render({}, {}) {
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
      }), preact.h("i", null, "Collapsed"))), preact.h("div", null, "Open Tab"), preact.h("div", {
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
      }), preact.h("i", null, "Transcript"))), preact.h("div", null, "Carousel"), preact.h("div", {
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
      }), preact.h("i", null, "Hidden"))), preact.h("div", null, "Initial Playback Speed"), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("input", {
        type: "number",
        name: "settings_initialspeed",
        step: "0.1",
        min: "0.5",
        max: "5",
        value: "1",
        required: true
      })), preact.h("hr", null), preact.h("h4", null, "Theme"), preact.h("div", null, "Playback Options"), preact.h("div", {
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
      }), preact.h("i", null, "Slider"))), preact.h("div", null, "Carousel"), preact.h("div", {
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
      }), preact.h("i", null, "Hidden"))), preact.h("hr", null), preact.h("h4", null, "Features"), preact.h("div", null, "(Changes after restarting)"), preact.h("div", null, "Machine Transcription"), preact.h("div", {
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
      }), preact.h("i", null, "Disabled"))), preact.h("div", null, "Silence Trimming"), preact.h("div", {
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
      }), preact.h("i", null, "Disabled"))), preact.h("div", null, "Noise z-value (Default is 2.37, determines interval of what will be classified as noise)"), preact.h("div", {
        onChange: this.settingsChange.bind(this)
      }, preact.h("input", {
        type: "number",
        name: "settings_silencethreshold",
        step: "0.01",
        value: "",
        required: true
      }), preact.h("i", null)), preact.h("div", {
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