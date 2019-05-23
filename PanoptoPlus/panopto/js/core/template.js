/**
 * Template class
 */
let Template = (() => {
    class Template {
        /**
         * Get the template in HTML format and convert it into DOM for manipulation and insertion into the page.
         * @param {string} fileName The filename of the template in panopto/templates. Use the full name with extension e.g. "sidebar.html".
         * @returns {DOM} DOM of the HTML file
         */
        static get(fileName) {
            return new Promise(function(resolve) {
                $.ajax({
                    url: chrome.extension.getURL(`/panopto/templates/${fileName}`),
                    success: function(data) {
                        //data is the HTML file in string format. $.parseHTML refers to https://api.jquery.com/jQuery.parseHTML/
                        //$ is shorthand for jQuery
                        return resolve($.parseHTML(data));
                    }
                });
            });
        }
    }
    return Template; 
})();