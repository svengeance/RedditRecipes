var tagify;
var fSearch;
var titleFilterElem = $('.search-name input');
var tagsFilterElem = $('.search-tags input');

$(async function() {
    await createRecipes();

    $('.recipe-backdrop').click(evt => {
        $(evt.currentTarget).fadeOut();
    });

    titleFilterElem.on('change keyup paste', async evt => {
        filterRecipes();
    })
    tagify = $('[name=tags]')
                .tagify({
                    enforceWhitelist: true,
                    whitelist: getAllRecipeTags() || [""],
                    maxTags: 10
                })
                .on('add', function(evt, tag) {
                    filterRecipes();
                })
                .on('remove', function(evt, tag) {
                    filterRecipes();
                });

    updateTagifyWhitelist();

    $('.header input,tags').click(async evt => {
        var data = await getAllRecipes();
        for (var recipe of data) {
            recipe.flatTags = (recipe.userTags || []).join(' ');
        }
        fSearch = new FuzzySearch(data, ['title', 'flatTags'], {
            sort: true
        });
    });

    remason();

    function createRecipeElement(data) {

        var deleteIcon = $('<img></img>')
            .addClass('recipe-remove')
            .attr('src', '/recipes_page/images/delete.svg');

        var image = $('<img></img>')
            .addClass('recipe-image')
            .attr('src', data.imageUrl);

        var title = $('<a></a>')
            .addClass('recipe-title')
            .attr('href', data.commentsUrl)
            .attr('target', '_blank')
            .text(data.title);

        var showText = $('<p></p>')
            .addClass('recipe-show')
            .text('View Recipe');
        
        var userTags = $('<input></input>')
            .addClass('recipe-tags')
            .attr('placeholder', 'Tag Recipe..');

        var userTagsTagContainer = $('<div></div>')
            .addClass('recipe-tags-tagContainer')
            .append(userTags);

        var userTagsContainer = $('<div></div>')
            .addClass('recipe-tags-container')
            .append(userTagsTagContainer);

        var titleContainer = $('<div></div>')
            .addClass('recipe-title-container')
            .append(title)
            .append(deleteIcon)
            .append(userTagsContainer)
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
            .append(titleContainer);
            
        var userNotes = $('<textarea></textarea>')
            .addClass('recipe-notes')
            .attr('placeholder', 'Add some notes..')
            .text(data.userNotes) || '';

        var jContainer = $('<div></div>')
            .addClass('recipe-container')
            .append(headerContainer)
            .append(userNotes)
            .data('recipe-data', data);

        autosize(userNotes);

        userNotes.on('autosize:resized', evt => {
            remason();
        });

        setTimeout(() => {
            autosize.update(userNotes);
        }, 10);

        var recipeTagify = userTags
            .tagify({
                maxTags: 10
            })
            .on('add', function(evt, tag) {
                if (!data.userTags) 
                    data.userTags = [tag.value]
                else {
                    if (data.userTags.indexOf(tag.value) == -1)
                        data.userTags.push(tag.value);
                    }
                updateRecipeData(this).then(done => {
                    updateTagifyWhitelist();
                });
                remason();
            }.bind(data))
            .on('remove', function(evt, tag) {
                var idx = data.userTags.indexOf(tag.value);
                if (idx != -1) {
                    data.userTags.splice(idx, 1);
                }
                updateRecipeData(this).then(done => {
                    updateTagifyWhitelist();
                });
                remason();
            }.bind(data));
        
        try { recipeTagify.data().tagify.addTags(Array.join(data.userTags || [], ','));
        } catch (e) {
            debugger;
        }

        userNotes.on('change keyup paste', function(evt) {
            data.userNotes = $(evt.target).val();
            updateRecipeData(data);
        }.bind(data));

        showText.click(function(evt) {
            showRecipe(this);
        }.bind(data));

        deleteIcon.click(function(evt) { 
            browser.storage.local.remove(this.key).then(success => {
                $('.recipe-container').remove();
                createRecipes();
                remason();
            });
        }.bind({key: data.commentsUrl}));

        $('.content').append(jContainer[0]);
    }

    function filterRecipes(which) {
        var titleFilter = titleFilterElem.val();
        var tags = $(tagify).data().tagify.value || [];
        var tagsFilter = tags.map(m => m.value).join(' ');
        fSearch.keys = ['title'];
        var titleSearchResult = fSearch.search(titleFilter);
        fSearch.keys = ['flatTags'];
        var tagsSearchResult = fSearch.search(tagsFilter);
        var filteredResult = titleSearchResult.filter(f => tagsSearchResult.indexOf(f) != -1)
            .map(m => m.commentsUrl);

        $('.recipe-container').each((idx, ele )=> {
            var data = $(ele).data('recipe-data');
            if (filteredResult.indexOf(data.commentsUrl) == -1) {
                $(ele).hide().detach().appendTo('.trashcan');
            } else {
                $(ele).detach().appendTo('.content').show();
            }
            remason();
        });
    }

    async function createRecipes() {
        var data = await browser.storage.local.get();
        for (var recipe in data) {
            createRecipeElement(data[recipe]);
        }
        remason();
    }

    function getHtml(text) {
        var elem = document.createElement('textarea');
        elem.innerHTML = text;
        var decoded = elem.value;
        elem.remove();
        return decoded;
    }

    async function getAllRecipeTags() {
        var data = await browser.storage.local.get();
        if (data) {
            return [].concat.apply([], Object.values(data)
                                             .map(m => m.userTags)
                                             .filter(f => f));
        }
    }

    async function getAllRecipes() {
        var data = await browser.storage.local.get();
        if (data) {
            return Object.values(data);
        }
    }

    function remason(destroy) {
        destroy && $('.content').masonry('destroy');
        $('.content').masonry('reloadItems');
        setTimeout(() => {
            $('.content').masonry({
                itemSelector: '.recipe-container'
            });
        }, 50);
    }

    function showRecipe(data) {
        $('.recipe-modal-title').text(data.title);
        $('.recipe-modal-body').html(getHtml(data.comment));
        $('.recipe-backdrop').fadeIn();
    }

    async function updateRecipeData(data) {
        var recipe = {};
        recipe[data.commentsUrl] = data;
        await browser.storage.local.set(recipe)
    }

    function updateTagifyWhitelist() {
        getAllRecipeTags().then(data => {
            tagify.data().tagify.settings.whitelist = data;
        });
    }
});
