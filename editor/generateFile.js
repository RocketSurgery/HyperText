var generateFile = (function () {
    'use strict';

    var generateFile = function (options) {

        options = options || {};
        if (!options.content) {
            throw new Error("Please enter all the required config options!");
        }

        var form = document.getElementById('submit');
        document.getElementById('submit_content').value = options.content;

        // Submitting the form to the node server. This will
        // cause the file download dialog box to appear.
        form.submit();
    };

    // setup on click response for link
    document.getElementById('export').onclick = function (e) {
        generateFile({
            content: "{\n\n}"
        });

        e.preventDefault();
    };

    return generateFile;
}());
