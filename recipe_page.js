$(function() {
    browser.storage.local.get().then(function(item) {
        for (var recipe in item) {
            createRecipeElement(item[recipe]);
        }

        $('body').masonry({
            itemSelector: '.recipe-container',
            columnWidth: 200
        });
    }, function(reason) {
        console.log(reason);
    });

    function createRecipeElement(data) {
        var image = $('<img></img>')
            .addClass('recipe-image')
            .attr('src', data.imageUrl);

        var title = $('<h3></h3>')
            .addClass('recipe-title')
            .text(data.title);

        var showText = $('<p></p>')
            .addClass('recipe-show')
            .text('View Recipe');

        var titleContainer = $('<div></div>')
            .addClass('recipe-title-container')
            .append(title)
            .append(showText);

        var flair = $('<span></span>')
            .addClass('recipe-flair')
            .text(data.type);

        var imageContainer = $('<div></div>')
            .addClass('recipe-image-container')
            .append(image)
            .append(flair);

        var headerContainer = $('<div></div>')
            .addClass('recipe-header-container')
            .append(imageContainer)
            .append(titleContainer)

        var jContainer = $('<div></div>')
            .addClass('recipe-container')
            .append(headerContainer)

        showText.click(function(evt) {
            showRecipe(this);
        }.bind(data));

        document.body.appendChild(jContainer[0]);
    }

    function getHtml(text) {
        var elem = document.createElement('textarea');
        elem.innerHTML = text;
        var decoded = elem.value;
        elem.remove();
        return decoded;
    }

    function showRecipe(data) {
        $('.recipe-modal-title').text(data.title);
        $('.recipe-modal-body').html(getHtml(data.comment));
        $('.recipe-backdrop').fadeIn();
    }

    $('.recipe-backdrop').click(evt => {
        $(evt.currentTarget).fadeOut();
    });
});
