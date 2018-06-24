browser.browserAction.onClicked.addListener(tab => {
    browser.tabs.create({
        url: "/recipes_page/recipe_page.html"
    });
});