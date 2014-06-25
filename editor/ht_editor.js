/*global hypertext, console*/
var ht_editor = document.querySelector('#editor');

(function (hypertext, editor) {
    'use strict';

    editor.passages = [ new hypertext.Passage() ];
    editor.selectedPassage = editor.passages[0];
    editor.rawVariables = '{\n    "player" : "bob"\n}';
    editor.context = { test : 'this is a test' };

    editor.newPassage = function (e, detail, sender) {
        editor.passages.push(new hypertext.Passage());
    };

    editor.selectPassage = function (e, detail, sender) {
        var index = sender.attributes.index.value;
        editor.selectedPassage = editor.passages[index];
    };

    editor.parseVariables = function (e, detail, sender) {
        try {
            editor.context = JSON.parse(editor.rawVariables);
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
        template.innerHTML = editor.selectedPassage.raw;
        previewArea.appendChild(template);
    };
}(hypertext, ht_editor));
