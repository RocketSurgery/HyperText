/*global hypertext*/
var ht_editor = document.querySelector('#editor');

(function (hypertext, editor) {
    'use strict';

    editor.passages = [ new hypertext.Passage() ];
    editor.selectedPassage = editor.passages[0];
}(hypertext, ht_editor));
