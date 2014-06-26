var context = (function () {
    'use strict';

    var context = {};
    context.test = 'cool stuff';

    var wrapper = document.getElementById('wrapper');

    var addTemplate = function () {
        var template = new document.createElement('template');
        template.setAttribute('is', 'auto-binding');
        template.context = context;

        template.innerHTML = "<template bind=\"{{context}}\"><p>The special text is: '{{test}}'<p></template>";

        document.body.appendChild(template);
    };

    wrapper.stuff = {
        test : '"test value all clear"'
    };
    wrapper.addTemplate = addTemplate;

    return context;
}());
