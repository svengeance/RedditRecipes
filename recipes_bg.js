browser.browserAction.onClicked.addListener(tab => {
    browser.tabs.create({
        url: "/recipe_page.html"
    });
});