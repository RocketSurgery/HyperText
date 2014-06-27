var hypertext = (function () {
    'use strict';

    var hypertext = {};
    hypertext.context = {};

    // define Passage
    hypertext.Passage = function () {
        this.title = 'New Passage';
        this.raw = 'This passage needs content.';
    };

    return hypertext;
}());
