/**
 * @file Cache, code to manage chrome runtime cache and their expiry
 */
let Cache = (() => {
    const EXPIRY_METADATA_ID = "EXPIRY";
    const EXPIRY_ENTRY_PREFIX = "DATE";
    
    /**
     * @private
     * @static
     * Retrieve a value from the chrome cache
     * @param {String} key key to use to retrieve an item from the Chrome cache
     * @returns Promise which returns the object stored under that key
     */
    function _retrieve(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key],(result) => { resolve(result[key]); });
        });
    }

    /**
     * @private
     * @static
     * Store a value into the chrome cache
     * @param {String} key identifier
     * * @param {Object} value value to store
     * @returns Promise which returns when task is done
     */
    function _store(key, value) {
        return new Promise((resolve) => {
            let kvp = {};
            kvp[key] = value;
            chrome.storage.local.set(kvp, () => { resolve(); });
        });
    }

    /**
     * @private
     * @static
     * Remove object(s) from the chrome cache
     * @param {String|Array.<String>} keyOrArray a single key or an array of keys.
     * @returns Promise which returns when task is done
     */
    function _remove(keyOrArray) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keyOrArray,() => { resolve(); });
        });
    }

    /**
     * @private
     * @static
     * Clear the entire cache, remove all objects.
     * @returns Promise which returns when task is done
     */
    function _clear() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(() => { resolve(); });
        });
    }

    /**
     * Cache, code to manage chrome runtime cache and their expiry
     * Cache Structure: 1. Expiry heap storing expiry dates. 2. Expiry Dates storing references that expire on that date.
     */
    class Cache {
        /**
         * Constructor is empty
         */
        constructor() {}

         /**
         * Init: initialize cache.
         * @returns {undefined}
         */
        static async init() {
            try {
                //Initialize using saved minheap
                let expiryMetadata = await _retrieve(EXPIRY_METADATA_ID) || {};
                this.expiryHeap = new MinHeap(expiryMetadata.heap);
                this.expirySet = expiryMetadata.set || {};
                let currentTimeDay = Cache.getCurrentExpiryKey();

                //Remove expired data
                while (currentTimeDay >= this.expiryHeap.getMin()) {
                    let expiryDayKey = this.expiryHeap.extractMin();
                    delete this.expirySet[expiryDayKey];
                    let expiryEntryKey = `${EXPIRY_ENTRY_PREFIX}${expiryDayKey}`;
                    let keysToRemove = await _retrieve(expiryEntryKey);
                    //Delete actual data
                    if (keysToRemove && keysToRemove.length > 0) await _remove(keysToRemove);
                    //Then delete the expiry entry
                    await _remove(expiryEntryKey);
                }

                //save minheap
                await Cache.saveMetadata();
            } catch (exception) {
                console.error(exception);
            }
        }

        /**
         * Get current expiry value (usually has a prefix in front) for storage / retrieval. 
         * Truncated to the nearest day.
         */
        static getCurrentExpiryKey() {
            //Truncate time to "time day"
            return new Date().getTime() / 1000 / 3600 / 24 | 0;
        }

        /**
         * Save meta data ({heap, set}) for expiry management.
         */
        static async saveMetadata() {
            await _store(EXPIRY_METADATA_ID, { heap : this.expiryHeap.toArray(), set: this.expirySet });
        }

        /**
         * Load settings from cache based on which one was last updated
         * @returns settings in formdata format
         */
        static async loadSettings() {
            //Global > Module > Webcast
            let result = await Cache.load(Cache.GLOBAL_SETTINGS_ID);
            let tmp = await Cache.load(`${Cache.MODULE_SETTINGS_PREFIX}${getModuleId()}`);
            if (result == null || (tmp != null && result[result.length - 1].value < tmp[tmp.length - 1].value)) {
                result = tmp;
            }
            tmp = await Cache.load(`${Cache.WEBCAST_SETTINGS_PREFIX}${getWebcastId()}`);
            if (result == null || (tmp != null && result[result.length - 1].value < tmp[tmp.length - 1].value)) {
                result = tmp;
            }
            return result;
        }

        /**
         * Load transcript
         * @returns transcript data
         */
        static async loadTranscript() {
            return await Cache.load(`${Cache.TRANSCRIPT_ENTRY_PREFIX}${getWebcastId()}`);
        }
        /**
         * Save transcript
         */
        static async saveTranscript(data) {
            return await Cache.save(`${Cache.TRANSCRIPT_ENTRY_PREFIX}${getWebcastId()}`, data, Cache.TRANSCRIPT_EXPIRY_OFFSET_DAYS);
        }

        /**
         * Save a kvp with expiry management
         * @param {String} key Identifier
         * @param {Object} value Object to store
         * @param {Number} expiryOffsetInDays Number of days from now to expiry
         */
        static async save(key, value, expiryOffsetInDays) {
            try {
                //If the key is not already allocated for expiry
                //Note this implementation does not override expiry dates; not an issue because the lifespan of a module is max 6mths
                if ((await _retrieve(key)) == null && expiryOffsetInDays != null) {
                    let expiryDayKey = Cache.getCurrentExpiryKey() + expiryOffsetInDays + 1;
                    //Save expiry heap if new entry
                    if (!this.expirySet[expiryDayKey]) {
                        this.expiryHeap.insertKey(expiryDayKey);
                        this.expirySet[expiryDayKey] = 1;
                        await Cache.saveMetadata();
                    }
                    //Save expiry entry
                    let expiryEntryKey = `${EXPIRY_ENTRY_PREFIX}${expiryDayKey}`;
                    let expiryEntryArr = (await _retrieve(expiryEntryKey)) || [];
                    expiryEntryArr.push(key);
                    await _store(expiryEntryKey, expiryEntryArr);
                }
                //Then save the actual data
                await _store(key, value);
            } catch (exception) {
                console.error(exception);
            }
        }

        /**
         * Load a value by key
         * @param {String} key identifier
         * @returns {Object} object
         */
        static async load(key) {
            return await _retrieve(key);
        }

        /**
         * Clears the cache
         */
        static async invalidateCache() {
            return await _clear();
        }
    }

    Cache.TRANSCRIPT_ENTRY_PREFIX = "TRANS-";
    Cache.GLOBAL_SETTINGS_ID = "MAIN_SETTINGS";
    Cache.MODULE_SETTINGS_PREFIX = "MODSET-";
    Cache.WEBCAST_SETTINGS_PREFIX = "WEBSET-";
    Cache.FIRST_TIME_KEY = "VIRGIN";
    Cache.TRANSCRIPT_EXPIRY_OFFSET_DAYS = 90;
    Cache.GLOBAL_SETTINGS_EXPIRY_OFFSET_DAYS = 9999;
    Cache.MODULE_SETTINGS_EXPIRY_OFFSET_DAYS = 180;
    Cache.WEBCAST_SETTINGS_EXPIRY_OFFSET_DAYS = 120;

    return Cache;
})();