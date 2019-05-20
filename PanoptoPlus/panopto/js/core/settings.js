/**
 * Singleton class
 */
function Settings() {
    throw new Error("Please use Settings.requestInstance to initialize Settings.");
}
(function() {
    var initiated = false;
    var instance = null;

    /**
     * Private constructor
     * @param {Boolean} subtitlesEnabled 
     * @param {Number} normalPlaybackRate 
     * @param {Boolean} silenceSkipEnabled 
     * @param {Number} silencePlaybackRate 
     */
    function _Settings(subtitlesEnabled = true, 
        normalPlaybackRate = 1.0, 
        silenceSkipEnabled = true, 
        silencePlaybackRate = 3, 
        harkThreshold = -50) {
        if (!initiated) {
            initiated = true;
            this.subtitlesEnabled = subtitlesEnabled;
            this.normalPlaybackRate = normalPlaybackRate;
            this.silenceSkipEnabled = silenceSkipEnabled;
            this.silencePlaybackRate = silencePlaybackRate;
            this.harkThreshold = harkThreshold;
        }
    }

    /**
     * Request instance using Promises
     */
    Settings.initialize = function() {
        return new Promise((resolve) => {
            if (!initiated) {
                Settings.load().then((result) => {
                    instance = new _Settings();
                    //instance = result;
                    initiated = true;
                    resolve(instance);
                }).catch(() => {
                    instance = new _Settings();
                    resolve(instance);
                });
            } else {
                resolve(instance);
            }
        });
    }

    Settings.getSubtitlesEnabled = function() { return instance.subtitlesEnabled; }
    Settings.getNormalPlaybackRate = function() { return instance.normalPlaybackRate; }
    Settings.getSilenceSkipEnabled = function() { return instance.silenceSkipEnabled; }
    Settings.getSilencePlaybackRate = function() { return instance.silencePlaybackRate; }
    Settings.getHarkThreshold = function() { return instance.harkThreshold; }

    Settings.setSubtitlesEnabled = function(val) { 
        instance.subtitlesEnabled = val;
        Settings.save();
    }
    Settings.setNormalPlaybackRate = function(val) { 
        instance.normalPlaybackRate = val;
        Settings.save();
    }
    Settings.setSilenceSkipEnabled = function(val) { 
        instance.silenceSkipEnabled = val;
        Settings.save();
    }
    Settings.setSilencePlaybackRate = function(val) { 
        instance.silencePlaybackRate = val;
        Settings.save();
    }
    Settings.setHarkThreshold = function(val) { 
        instance.harkThreshold = val;
        Settings.save();
    }
    
    /**
     * Load from chrome storage using Promises
     * KIV: segregated settings for each module
     */
    Settings.load = function() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['settings'],(res) => {
                if (res['settings']) resolve(res['settings']);
                else reject();
            });
        });
    }
    
    /**
     * Saving of settings into chrome storage
     */
    Settings.save = function() {
        var kvp = {};
        kvp['settings'] = instance;
        chrome.storage.local.set(kvp,() => {});
    }
})();