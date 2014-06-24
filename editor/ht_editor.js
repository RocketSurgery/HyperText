/*global hypertext, console*/
var ht_editor = document.querySelector('#editor');

(function (hypertext, editor) {
    'use strict';

    editor.passages = [ new hypertext.Passage() ];
    editor.selectedPassage = editor.passages[0];
    editor.rawVariables = '{\n    "player" : "bob"\n}';

    editor.newPassage = function (e, detail, sender) {
        editor.passages.push(new hypertext.Passage());
    };

    editor.selectPassage = function (e, detail, sender) {
        var index = sender.attributes.index.value;
        editor.selectedPassage = editor.passages[index];
    };

    editor.parseVariables = function (e, detail, sender) {
        try {
            hypertext.context = JSON.parse(editor.rawVariables);
        } catch (exception) {
        }
    };
}(hypertext, ht_editor));
