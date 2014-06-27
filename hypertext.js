var hypertext = (function () {
    'use strict';

    var hypertext = function (passages, context) {
        this.passages = passages || [];
        this.context = context || {};
    };

    // define Passage
    hypertext.Passage = function () {
        this.title = 'New Passage';
        this.raw = 'This passage needs content.';
    };

    return hypertext;
}());
