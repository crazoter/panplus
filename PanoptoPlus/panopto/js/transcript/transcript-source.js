/**
 * Abstract class for transcript source
 */
let TranscriptSource = (() => {
    class TranscriptSource {
        constructor() {}
        /**
         * Abstract function to call code to retrieve transcript in data format
         * [{time: Number, text: String},...]
         * @returns Promise, with 1 parameter [{time: Number, text: String},...]
         */
        retrieve() {
            throw new Error("TranscriptSource retrieve is not implemented!");
        }
    }
    return TranscriptSource;
})();