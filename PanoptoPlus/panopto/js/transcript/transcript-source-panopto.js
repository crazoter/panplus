/**
 * Transcript source using Panopto
 */
let TranscriptSourcePanopto = (() => {
    /**
     * Private static function, declaration of function to inject on the page itself
     */
    function functionToInject() {
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

    /**
     * Private static function, Parse transcript to [{time: Number, text: String},...] format
     * @param {PanoptoTranscript} fullData Transcript in Panopto's format (see below)
     */
    function parse(fullData) {
        if (!fullData || fullData.Error) {
            if (!fullData) throw new Error("Failed to obtain Transcript, request failed");
            throw new Error("Failed to obtain Transcript. Error Message: " + fullData.ErrorMessage);
        }

        let data = [];
        for (let i = 0; i < fullData.Events.length; i++) {
            let obj = fullData.Events[i];
            if (obj.EventTargetType === "MachineTranscript") {
                data.push({time: obj.Time, text: obj.Data});
            }
        }
        return data;
    }

    class TranscriptSourcePanopto extends TranscriptSource {
        constructor() { super(); }

        retrieve() {
            return new Promise((resolve) => {
                //Create bridge
                let bridge = new ContextBridge(functionToInject, "transcriptGetEvent");
                //Perform one time request and process fullData
                bridge.request().then(fullData => {
                    resolve(parse(fullData));
                });
            });
        }
    }
    return TranscriptSourcePanopto;
})();

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