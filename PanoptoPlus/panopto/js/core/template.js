function Template() {}
Template.get = function(url) {
    return new Promise(function(resolve) {
        $.ajax({
            url: chrome.extension.getURL('/panopto/templates/'+url),
            success: function(data) {
                return resolve($.parseHTML(data));
            }
        });
    });
}