(function () {
    'use strict';

    var temp = document.getElementById('wrapper'),
        addTemplate = function () {
            var template = new document.createElement('template');
            template.setAttribute('is', 'auto-binding');
            template.context = {
                test : 'coolio'
            };

            template.innerHTML = "<template bind=\"{{context}}\"><p>The special text is: '{{test}}'<p></template>";

            document.body.appendChild(template);
        };

    temp.stuff = {
        test : '"test value all clear"'
    };
    temp.addTemplate = addTemplate;
}());
