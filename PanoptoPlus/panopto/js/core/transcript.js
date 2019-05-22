/**
 * Transcript class manages the retrieval and caching of transcripts.
 */
function Transcript(fullData) {
    /**
     * Format (JSON):
     * {
        "Error": {boolean},
        "ErrorMessage": {null||string?},
        "Events": [
            {
                "AbsoluteTime": 0,
                "Caption": "",
                "CreatedDuringWebcast": {boolean},
                "CreationDateTime": {string},
                "CreationTime": {Number},
                "Data": {null||string?},
                "EventTargetType": {string},
                "ID": {Number},
                "IsQuestionList": {boolean},
                "IsSessionPlaybackBlocking": {boolean},
                "ObjectIdentifier": {string},
                "ObjectPublicIdentifier": {string},
                "ObjectSequenceNumber": {string},
                "ObjectStreamID": {string},
                "PublicId": {string},
                "SessionID": {string},
                "Time": {Number},
                "Url": {null||string?},
                "UserDisplayName": {null||string?},
                "UserInvocationRequiredInUrl": {boolean},
                "UserName": {string}
            },...
        }
     */
    //Initialize data
    var data = [];
    if (fullData) {
        if (fullData.Error) {
            throw new Error("Failed to obtain Transcript. Error Message: " + fullData.ErrorMessage);
        } else {
            //Important keys: EventTargetType, Data, Time
            for (var i = 0; i < fullData.Events.length; i++) {
                var obj = fullData.Events[i];
                if (obj.EventTargetType === "MachineTranscript") {
                    data.push({time: obj.Time, text: obj.Data});
                }
            }
        }
    }

    this.getData = function() { return data; }
    this.setData = function(d) { data = d; }

    /**
     * Generate VTTCue based on data
     * https://iandevlin.com/blog/2015/02/javascript/dynamically-adding-text-tracks-to-html5-video/
     * @param {Number} index index to access
     * @param {Number} flashDelay time to hide previous subtitle and show next. Default is 0.2s.
     * @param {Number} lastIndexDuration time to show last subtitle. Default is 10s.
     */
    this.getVttCue = function(index, flashDelay = 0.2, lastIndexDuration = 10) {
        if (index >= 0 && index < data.length) {
            if (index !== data.length - 1) {
                return new VTTCue(data[index].time, data[index+1].time - flashDelay, data[index].text);
            } else {
                //Since data has no end time and this is the last index, we'll just use a magic duration
                return new VTTCue(data[index].time, data[index].time + lastIndexDuration, data[index].text);
            }
        } else {
            throw new Error("Transcript out of bounds: Tried to access index " + index);
        }
    }

    /**
     * Convert to VTTCueArray for subtitling
     * @param {Number} flashDelay time to hide previous subtitle and show next. Default is 0.2s.
     * @param {Number} lastIndexDuration time to show last subtitle. Default is 10s.
     */
    this.toVTTCueArray = function(flashDelay, lastIndexDuration) {
        var result = [];
        for (var i = 0; i < data.length; i++)
            result.push(this.getVttCue(i, flashDelay, lastIndexDuration));
        return result;
    }
}
//Closure to support private static variable
(function() {
    /**Problem: Multiple parts of our code needs the transcript. 
     * We don't want to call the AJAX function multiple times, so everytime it is required and it's not ready, we add it to callbacks
     * Once it's ready, we call all these callbacks as required.
     * http://api.jquery.com/category/callbacks-object/
     */
    var callbacks = $.Callbacks();
    var cachedTranscript = null;
    var isGettingTranscript = false;
    if (document.forms[0]) {
        var key = 'transcript-' + $.urlParam(document.forms[0].action, "id");
    } else throw new Error("Transcript.js: Unable to get webcast ID");

    Transcript.get = function() {
        return new Promise(function(resolve) {
            //TODO: add extension storage
            if (cachedTranscript) {
                return resolve(cachedTranscript);
            } else if (isGettingTranscript) {
                callbacks.add(function() {
                    return resolve(cachedTranscript);
                });
            } else {
                isGettingTranscript = true;
                chrome.storage.local.get([key], (result) => {
                    if (result[key]) {
                        console.log("Cache used");
                        var transcript = new Transcript();
                        transcript.setData(result[key]);
                        return finishTranscriptGet(resolve, transcript);
                    } else {
                        return processTranscriptGet(resolve);
                    }
                });
            }
        });
    }

    var processTranscriptGet = function(resolve) {
        //Create injected function
        var injectedFunction = function() {
            //Need to redeclare this method because it's run on the webpage itself
            $.urlParam = function (url, name) {
                var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
                return (results !== null) ? results[1] || 0 : false;
            };
            $.ajax({
                type: "POST",
                url: window.location.origin+"/Panopto/Pages/Viewer/Search/Results.aspx",
                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                data: {
                    id: $.urlParam(document.forms[0].action, "id"),
                    type: "",
                    query: "",
                    notesUser: "",
                    channelName: "",
                    refreshAuthCookie: true,
                    deliveryRelative: true,
                    responseType: "json"
                },
                success: function(data) {
                    bridgeCallback(data);
                }
            });
        };
        
        //Create bridge
        var bridge = new ContextBridge(injectedFunction, "transcriptGetEvent");

        //Perform one time request and process data
        bridge.request().then(data => {
            //Process data
            var transcript = new Transcript(data);
            //Save
            var kvp = {};
            kvp[key] = transcript.getData();
            chrome.storage.local.set(kvp, () => console.log("Saved " + key));
            return finishTranscriptGet(resolve, transcript);
        });
    }

    var finishTranscriptGet = function(resolve, transcript) {
        cachedTranscript = transcript;
        callbacks.fire();
        callbacks.empty();
        return resolve(transcript);
    }
})();