/**
 * @file TranscriptRequester class manages the retrieval and caching of transcripts.
 */
let TranscriptRequester = (() => {
    const DEBUG_TRANSCRIPT_REQUEST = 1;
    //Private static variables
    /**Problem: Multiple parts of our code needs the transcript. 
     * We don't want to call the AJAX function multiple times, so everytime it is required and it's not ready, we add it to callbacks
     * Once it's ready, we call all these callbacks as required.
     * http://api.jquery.com/category/callbacks-object/
     */
    let callbacks = $.Callbacks();
    let cachedTranscript = null; //Transcript object
    let isGettingTranscript = false;
    let key = "";
    //All panopto webcast websites have a form (the search bar)
    if (document.forms[0]) { key = `transcript-${$.urlParam(document.forms[0].action, "id")}`; } 
    else throw new Error("Transcript.js: Unable to get webcast ID");

    /**
     * private static function to process transcript get if cache doesn't hit
     * @private
     * @static
     * @param {TranscriptSource} transcriptSrc transcript source
     * @param {function} resolve Resolve of 1 parameter of Array.<{time: Number, text: String}>
     * @return {undefined}
     */
    function getTranscript(transcriptSrc, resolve) {
        transcriptSrc.retrieve().then((data) => {
            let kvp = {};
            kvp[key] = data;
            chrome.storage.local.set(kvp, () => console.log("Saved " + key));
            return finishGettingTranscript(resolve, data);
        });
    }

    /**
     * private static method, helper class to abstract repeated stuff upon finish transcript get
     * @private
     * @static
     * @param {function} resolve Resolve of 1 parameter of Array.<{time: Number, text: String}>
     * @param {Array.<{time: Number, text: String}>} data processed data which can be packaged as a Transcript.
     * @return {undefined}
     */
    function finishGettingTranscript(resolve, data) {
        cachedTranscript = new Transcript(data);
        callbacks.fire();
        callbacks.empty();
        return resolve(cachedTranscript);
    }

    /**
     * TranscriptRequester class manages the retrieval and caching of transcripts.
     */
    class TranscriptRequester {
        /**
         * Constructor is empty
         */
        constructor() {}

        /**
         * Get transcript from transcript source and cache if needed
         * @param {TranscriptSource} transcriptSrc Transcript source to get transcript from
         * @returns {Promise} promise to get the transcript using transcript source
         */
        static get(transcriptSrc) {
            return new Promise(function(resolve) {
                //If already requested, just use it
                if (cachedTranscript) {
                    return resolve(cachedTranscript);
                } else if (isGettingTranscript) {
                    //If in the process of retrieving, wait for it
                    callbacks.add(() => {
                        return resolve(cachedTranscript);
                    });
                } else {
                    //Else, attempt to get transcript from cache
                    isGettingTranscript = true;
                    chrome.storage.local.get([key], (result) => {
                        return result[key] && !DEBUG_TRANSCRIPT_REQUEST 
                            ? finishGettingTranscript(resolve, result[key])
                            : getTranscript(transcriptSrc, resolve);
                    });
                }
            });
        }
    }
    return TranscriptRequester;
})();