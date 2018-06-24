$(function() {
    createRecipes();

    $('.recipe-backdrop').click(evt => {
        $(evt.currentTarget).fadeOut();
    });

    function createRecipeElement(data) {

        var deleteIcon = $('<img></img>')
            .addClass('recipe-remove')
            .attr('src', '/recipes_page/images/delete.svg');

        var image = $('<img></img>')
            .addClass('recipe-image')
            .attr('src', data.imageUrl);

        var title = $('<a></a>')
            .addClass('recipe-title')
            .attr('href', data.redditUrl)
            .attr('target', '_blank')
            .text(data.title);

        var showText = $('<p></p>')
            .addClass('recipe-show')
            .text('View Recipe');

        var titleContainer = $('<div></div>')
            .addClass('recipe-title-container')
            .append(title)
            .append(deleteIcon)
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

        deleteIcon.click(function(evt) {
            browser.storage.local.remove(this.key).then(success => {
                $('body').masonry('destroy');
                $('.recipe-container').remove();
                createRecipes();
                setTimeout(() => {
                    $('body').masonry({
                        itemSelector: '.recipe-container',
                        columnWidth: 200, 
                    });
                }, 50);
            });
        }.bind({key: data.redditUrl}));

        document.body.appendChild(jContainer[0]);
    }

    function createRecipes() {
        browser.storage.local.get().then(function(item) {
            for (var recipe in item) {
                item[recipe]["redditUrl"] = recipe;
                createRecipeElement(item[recipe]);
            }
    
            $('body').masonry({
                itemSelector: '.recipe-container',
                columnWidth: 200,
            });
        }, function(reason) {
            console.log(reason);
        });        
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
});
