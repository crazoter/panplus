/**
 * Transcript class manages the retrieval and caching of transcripts.
 */
function Transcript(data) {
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
    this.data = [];
    if (data.Error) {
        throw new Error("Failed to obtain Transcript. Error Message: " + data.ErrorMessage);
    } else {
        //Important keys: EventTargetType, Data, Time
        for (var i = 0; i < data.Events.length; i++) {
            var obj = data.Events[i];
            if (obj.EventTargetType === "MachineTranscript") {
                this.data.push({time: obj.Time, text: obj.Data});
            }
        }
    }
    //More functions
}
Transcript.get = function() {
    return new Promise(function(resolve) {
        //Create injected function
        var injectedFunction = function() {
            //Need to redeclare this method because it's run on the webpage itself
            $.urlParam = function (name) {
                var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
                return (results !== null) ? results[1] || 0 : false;
            };
            $.ajax({
                type: "POST",
                url: window.location.origin+"/Panopto/Pages/Viewer/Search/Results.aspx",
                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                data: {
                    id: $.urlParam("id"),
                    type: "",
                    query: "ssfs",
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
            //store transcript in chrome.storage if necessary
            return resolve(transcript);
        });
    });
}