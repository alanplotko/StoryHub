var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var request = require('superagent'); // Module to make requests to GitHub
var LocalStorage = require('node-localstorage').LocalStorage; // Module to emulate LocalStorage for the app
var shLocalStorage = new LocalStorage('./StoryHub');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Your GitHub Applications Credentials
    var options = {
        client_id: process.env['STORYHUB_CLIENTID'],
        client_secret: process.env['STORYHUB_CLIENTSECRET'],
        scopes: ["user:email", "notifications", "public_repo"]
    }

    // Build the OAuth consent page URL
    var authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
    var githubUrl = 'https://github.com/login/oauth/authorize?';
    var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scopes;
    authWindow.loadUrl(authUrl);
    authWindow.show();

    // Handle the response from GitHub
    authWindow.webContents.on('did-get-redirect-request', function(event, oldUrl, newUrl) {
        var raw_code = /code=([^&]*)/.exec(newUrl) || null,
        code = (raw_code && raw_code.length > 1) ? raw_code[1] : null,
        error = /\?error=(.+)$/.exec(newUrl);

        // If there is a code in the callback, proceed to get token from github
        if (code) {
            request.post('https://github.com/login/oauth/access_token', {
                client_id: options.client_id,
                client_secret: options.client_secret,
                code: code
            }).end(function (err, response) {
                if (response && response.ok) {
                    console.log(response);
                    // Successfully received token; store it
                    shLocalStorage.setItem('githubtoken', response.body.access_token);

                    // Create the browser window
                    mainWindow = new BrowserWindow({
                        width: 800,
                        height: 600,
                        'min-width': 500,
                        'min-height': 200,
                        'accept-first-mouse': true,
                        'title-bar-style': 'hidden'
                    });

                    authWindow.close();

                    // and load the index.html of the app.
                    mainWindow.loadUrl('file://' + __dirname + '/index.html');

                    // Open the DevTools.
                    //mainWindow.openDevTools();

                    // Emitted when the window is closed.
                    mainWindow.on('closed', function() {
                        // Dereference the window object, usually you would store windows
                        // in an array if your app supports multi windows, this is the time
                        // when you should delete the corresponding element.
                        mainWindow = null;
                    });
                }
                else {
                    // Error, show messages
                    console.log(err);
                }
            });
        }
        else if (error) {
            alert("Oops! Something went wrong and we couldn't log you in using Github. Please try again.");
        }
    });
    // Reset the authWindow on close
    authWindow.on('close', function() {
        authWindow = null;
    }, false);
});
