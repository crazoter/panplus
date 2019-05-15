function Transcript() {}
Transcript.get = function() {
    return new Promise(function(resolve) {
        var bridge = new ContextBridge(function() {
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
        }, "transcriptGetEvent");
        bridge.request().then(data => {
            //Process data
            return resolve(data);
        });
    });
}