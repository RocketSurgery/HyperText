var specialText = 'special text for stuff';

function addTemplate() {
    'use strict';

    var template = new document.createElement('template');
    template.setAttribute('is', 'auto-binding');

    template.innerHTML = "<p>The special text is: '{{stuff}}'<p>";
    template.stuff = specialText;

    document.body.appendChild(template);
}
