/*global hypertext, console*/
var ht_editor = document.querySelector('#editor');

(function (hypertext, editor) {
    'use strict';

    editor.passages = [];
    editor.selectedPassage = editor.passages[0];
    editor.rawVariables = '{\n    "player" : "bob"\n}';
    editor.context = JSON.parse(editor.rawVariables);

    editor.newPassage = function (e, detail, sender) {
        editor.passages.push(new hypertext.Passage());
        editor.selectedPassage = editor.passages[editor.passages.length - 1];
        editor.updatePreview();
    };

    editor.selectPassage = function (e, detail, sender) {
        var index = sender.attributes.index.value;
        editor.selectedPassage = editor.passages[index];
        editor.updatePreview();
    };

    editor.parseVariables = function (e, detail, sender) {
        try {
            editor.context = JSON.parse(editor.rawVariables);
            editor.updatePreview();
        } catch (exception) {
            // TODO display some message letting the user know
        }
    };

    editor.updatePreview = function () {
        var previewArea = editor.$.preview_area,
            template = new document.createElement('template');

        // remove existing children
        while (previewArea.firstChild) {
            previewArea.removeChild(previewArea.firstChild);
        }

        // insert new preview
        template.setAttribute('is', 'auto-binding');
        template.innerHTML = '<template bind="{{context}}">' +
            editor.selectedPassage.raw +
            '</template>';
        template.context = editor.context;
        previewArea.appendChild(template);
    };

    editor.generateFile = function (e, detail, sender) {
        var content = JSON.stringify(editor.passages);
        editor.$.submit_content.value = content;
        editor.$.submit.submit();
    };

    editor.addEventListener('template-bound', function () {
        editor.newPassage();
    });

}(hypertext, ht_editor));
