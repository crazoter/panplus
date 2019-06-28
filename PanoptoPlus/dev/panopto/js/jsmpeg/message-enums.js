/**
 * An enumeration of various message types that can be sent between the main thread and the worker.
 * Previously all of these enums were used, but now only NOISE_RESULTS, NORMAL_RESULTS and ERROR are used (DEBUG is used only for dev purposes)
 * @enum {Number}
 */
MessageEnums = {
    INITIALIZATION_PARAMS: 0,
    INITIALIZATION_SUCCESS: 1,
    NOISE_RESULTS: 2,
    NORMAL_RESULTS: 3,
    REQUEST_RESULTS: 4,
    DEBUG: 5,
    DEBUG_HISTOGRAM: 6,
    RAW_DATA_RESULTS: 7,
    ERROR: 8
};