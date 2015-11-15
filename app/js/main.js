function createStory() {
    $('.pane.content').fadeOut('', function() {
        $('.pane.content').html('<form id="createStory" method="POST"><div class="form-group"><label>Story Name</label><input type="text" name="storyName" class="form-control" placeholder="Story Name"></div><div class="form-group"><label>Story Description</label><input type="textarea" name="storyDescription" class="form-control" placeholder="Story Description"></div><div class="form-actions"><button type="submit" class="btn btn-form btn-primary"">Create Story</button><button class="btn btn-form btn-default" onclick="location.reload();">Cancel</button></div></form>');
        $('.pane.content').fadeIn();
    });
}

$('form#createStory').submit(function() {
    $.ajax({
        type: "POST",
        url: "https://api.github.com/user/repos?access_token=" + shLocalStorage.getItem('githubtoken'),
        data: {
            name: $('form#createStory input[name="storyName"]').val(),
            description: $('form#createStory input[name="storyDescription"]').val()
        },
        success: function(data) {
            alert("Successfully created project: '" + this.data.name + "'");
        }
    });
});

function firstLoad()
{
    var LocalStorage = require('node-localstorage').LocalStorage; // Module to emulate LocalStorage for the app
    shLocalStorage = new LocalStorage('./StoryHub');
    $.get("https://api.github.com/user?access_token=" + shLocalStorage.getItem('githubtoken')).done(function(data) {
        $('.toolbar-actions').append("<div class='btn btn-default pull-right'><span class='icon icon-github'></span> &nbsp; Welcome back, " + data.name + "!</div>");

        $('.toolbar-actions').append('<div class="btn-group"><button class="btn btn-default" onclick="createStory();"><span class="icon icon-list-add"></span> &nbsp; Create Story</button>');
    }).fail(function() {
        $('.toolbar-actions').append('<button class="btn btn-default" onclick="gitHubAuth()"><span class="icon icon-github"></span> &nbsp; Login with GitHub</button>');
        $(".nav-group").append('<span class="nav-group-item">Login to see your stories.</span>');
    });
    $.get( "https://api.github.com/user/repos?access_token=" + shLocalStorage.getItem('githubtoken'), function(data) {
        var count = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].name.search("(StoryHub)") != -1)
            {
                $(".nav-group").append('<span class="nav-group-item"><span class="icon icon-book"></span>' + data[i].name + '</span>');
                count++;
            }
            //$("#repo-content").append("<tr><td>" + data[i].name + "</td><td>" + data[i].owner.login + "</td><td>" + data[i].description + "</td></tr>");
        }                
        if (count == 0)
        {
            $(".nav-group").append('<span class="nav-group-item">No stories found!</span>');
            $("#loading").fadeOut('', function() {
                $('.pane.content').append('<p>To create a new story project, click on the leftmost icon in the navigation.</p>');
            });
        }
        else
        {
            $("#repo-content").append("<tr><td colspan='3'>Select a book on the left!</td></tr>");
            $.when($("#loading").fadeOut()).then($("#data").show());
        }
    });
};