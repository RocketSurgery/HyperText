/*global hypertext*/
var ht_editor = document.querySelector('#editor');

(function (hypertext, editor) {
    'use strict';

    editor.passages = [ new hypertext.Passage() ];
    editor.selectedPassage = editor.passages[0];

    editor.newPassage = function (e, detail, sender) {
        editor.passages.push(new hypertext.Passage());
    };

    editor.selectPassage = function (e, detail, sender) {
        var index = sender.attributes.index.value;
        editor.selectedPassage = editor.passages[index];
    };
}(hypertext, ht_editor));
