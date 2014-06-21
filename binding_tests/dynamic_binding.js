specialText = 'special text for stuff';

function addTemplate()
{
        var template = new document.createElement('template');
        template.setAttribute('is', 'auto-binding');

        template.innerHTML = "The special text is: '{{stuff}}'";
        template.stuff = specialText;

        document.body.appendChild(template);
}
