var generateFile = (function () {
    'use strict';

    var generateFile = function (options) {

        options = options || {};
        if (!options.filename || !options.content) {
            throw new Error("Please enter all the required config options!");
        }

        var form = document.getElementById('submit');

        form.setAttribute('action', '/');
        document.getElementById('submit_filename').value = options.filename;
        document.getElementById('submit_content').value = options.content;

        // Submitting the form to the node server. This will
        // cause the file download dialog box to appear.
        form.submit();
    };

    // setup on click response for link
    document.getElementById('download').onclick = function (e) {
        generateFile({
            filename: 'export.txt',
            content: document.getElementById('user_input').value
        });

        e.preventDefault();
    };

    return generateFile;
}());
