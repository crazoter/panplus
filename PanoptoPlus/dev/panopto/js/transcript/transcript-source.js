/**
 * @file Abstract class for transcript source
 */
let TranscriptSource = (() => {
    /**
     * Abstract class for transcript source
     * @abstract
     */
    class TranscriptSource {
        constructor() {}

        /**
         * Abstract function to call code to retrieve transcript in data format
         * (Array.<{time: Number, text: String}>)
         * @abstract
         * @returns {Promise} Promise with resolve of 1 parameter of Array.<{time: Number, text: String}>
         */
        retrieve() {
            throw new Error("TranscriptSource retrieve is not implemented!");
        }
    }
    return TranscriptSource;
})();