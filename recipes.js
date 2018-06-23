var baseUrl = `${window.location.protocol}//${window.location.host}`;

var saveElement = document.createElement("li");
var saveLink = document.createElement("a");
saveLink.innerText = "save_recipe";

saveElement.appendChild(saveLink);

document.querySelectorAll("div.entry ul.flat-list").forEach(ele => {
    var clone = saveElement.cloneNode(true);
    clone.addEventListener("click", function(evt) {
        var topLevelElement = this.closest(".top-matter");
        var postUrl = topLevelElement.querySelector("a.comments").getAttribute("href");
        var author = topLevelElement.querySelector("a.author").innerText;
        var flairElement = topLevelElement.querySelector("span.linkflairlabel"); 
        var flair = "Uncategorized"; 
        if (flairElement) 
            flair =  flairElement.getAttribute("title");
        var req = new XMLHttpRequest();
        req.onload = function(evt) {
            var comments = JSON.parse(this.responseText);
            if (!comments || comments.length == 1) return;
            var OPComment = comments[1].data.children.find(f => f.data && f.data.author == author);
            if (OPComment) {
                var title = comments[0].data.children[0].data.title;
                var thumbNail = comments[0].data.children[0].data.thumbnail;
                saveRecipe(title, thumbNail, OPComment.data.body_html, flair, postUrl);
            }
        };
        if (!postUrl.indexOf('http') == -1) {
            req.open("GET", `${baseUrl}${postUrl}.json`);
        } else {
            req.open("GET", `${postUrl}.json`);
        }
        req.send();
    });
    ele.appendChild(clone);
});

function saveRecipe(title, imageUrl, comment, type, commentsUrl) {
    var saveData = {};
    saveData[commentsUrl] = { title, imageUrl, comment, type };
    browser.storage.local.set(saveData);
}

browser.storage.local.get().then(function(item) {
    for (var recipe in item) {
        console.log(item[recipe].title);
    }
}, function(reason) {
    console.log(reason);
});