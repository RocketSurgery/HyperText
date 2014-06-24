var hypertext = (function () {
    'use strict';

    var hypertext = {};

    // define Passage
    hypertext.Passage = function () {
        this.title = 'New Passage';
        this.raw = 'This passage needs content.';
    };

    hypertext.context = {};

    return hypertext;
}());
