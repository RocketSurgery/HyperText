$(document).ready(function () {

    $('#download').click(function (e) {

        $.generateFile({
            filename: 'export.txt',
            content: $('textarea').val(),
            script: '/'
        });

        e.preventDefault();
    });

});
