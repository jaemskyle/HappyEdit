var files = {};
var editor;
var editorElement;
var currentFile;
var HOST = 'http://localhost:8888';

var Mode = function(name, desc, clazz, extensions) {
    this.name = name;
    this.desc = desc;
    this.clazz = clazz;
    this.mode = new clazz();
    this.mode.name = name;
    this.extRe = new RegExp("^.*\\.(" + extensions.join("|") + ")$", "g");
};

Mode.prototype.supportsFile = function(filename) {
    return filename.match(this.extRe);
};

var modes = [
    new Mode("text", "Text", require("ace/mode/text").Mode, ["txt"]),
    new Mode("html", "HTML", require("ace/mode/html").Mode, ["html", "htm"]),
    new Mode("css", "CSS", require("ace/mode/css").Mode, ["css"]),
    new Mode("javascript", "JavaScript", require("ace/mode/javascript").Mode, ["js"]),
    new Mode("json", "JSON", require("ace/mode/json").Mode, ["json"]),
    new Mode("python", "Python", require("ace/mode/python").Mode, ["py"]),
    new Mode("php", "PHP",require("ace/mode/php").Mode, ["php"]),
    new Mode("text", "Text", require("ace/mode/text").Mode, ["txt"]),
    new Mode("diff", "Diff", require("ace/mode/diff").Mode, ["diff"])
];

function updateSize() {
    var w = window.innerWidth;
    var h = window.innerHeight - document.querySelector('#top').offsetHeight;

    editorElement.style.width = w + 'px';
    editorElement.style.height = h + 'px';
}

window.onload = function() {
    editor = ace.edit("editor");
    editorElement = document.getElementById('editor');

    CommandLine.init();
    Settings.init();
    TopBar.init();
    ProjectFiles.init();

    window.onresize = function(event) {
        updateSize();
    }

    updateSize();

    editor.setKeyboardHandler(require("ace/keyboard/vim").handler);
    editor.setAnimatedScroll(true);

    editor.commands.addCommand({
        name: "save",
        bindKey: {
            win: "Ctrl-S",
            mac: "Command-S",
            sender: "editor"
        },
        exec: function() {
            window.currentFile.save();
        }
    });

    editor.commands.addCommand({
        name: "commandT",
        bindKey: {
            win: "Ctrl-T",
            mac: "Command-T",
            sender: "editor"
        },
        exec: function() {
            CommandLine.show('');
        }
    });

    editor.commands.addCommand({
        name: "nextTab",
        bindKey: {
            win: "Ctrl-Tab",
            mac: "Command-Shift-]",
            sender: "editor"
        },
        exec: function() {
            TopBar.nextTab();
        }
    });

    editor.commands.addCommand({
        name: "prevTab",
        bindKey: {
            win: "Ctrl-Shift-Tab",
            mac: "Command-Shift-[",
            sender: "editor"
        },
        exec: function() {
            TopBar.prevTab();
        }
    });

    editor.commands.addCommand({
        name: "openFile",
        bindKey: {
            win: "Ctrl-O",
            mac: "Command-O",
            sender: "editor"
        },
        exec: function() {
            openLocalFile();
        }
    });

    editor.commands.addCommand({
        name: "closeFile",
        bindKey: {
            win: "Ctrl-W",
            mac: "Command-W",
            sender: "editor"
        },
        exec: function() {
            closeFile(window.currentFile);
        }
    });

    editor.getKeyboardHandler().actions[':'] = {
        fn: function(editor, range, count, param) {
            CommandLine.show(":");
        }
    };

    editor.getKeyboardHandler().actions['/'] = {
        fn: function(editor, range, count, param) {
            CommandLine.show("/");
        }
    };

    editor.getKeyboardHandler().actions['?'] = {
        fn: function(editor, range, count, param) {
            CommandLine.show("?");
        }
    };

    Storage.get('previouslyOpenedFile', null, function(previouslyOpenedFile) {
        if (previouslyOpenedFile) {
            openRemoteFile(previouslyOpenedFile);
        }
    });
};

function getModeForFile(filename) {
    var mode = modes[0];
    for (var i = 0; i < modes.length; i++) {
        if (modes[i].supportsFile(filename)) {
            mode = modes[i];
            break;
        }
    }
    return mode.mode;
}

function switchToFile(file, updateTabs) {
    window.currentFile = file;
    window.editor.setSession(file.getSession());

    if (updateTabs || updateTabs === undefined) {
        TopBar.updateView(file);
    }
}

function getNumberOfOpenFiles() {
    return TopBar.tabs.length;
}

function closeFile(file) {
    if (getNumberOfOpenFiles() > 1) {
        var tab = TopBar.getTabForFile(file);
        tab.close(true);
        delete files[currentFile.name];
    } else {
        window.close();
    }
}

function getOrLoadRemoteFile(filename, callback) {
    if (window.files.hasOwnProperty(filename)) {
        callback(window.files[filename]);
        return;
    }

    var xhr = new XMLHttpRequest();
    var url = HOST + '/files/' + filename;
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
        var file;
        if (xhr.readyState == 4) {
            file = new RemoteFile(filename, xhr.responseText);
            files[filename] = file;
            callback(file);
        }
    };
    xhr.send();
}

function openRemoteFile(filename) {
    var file;

    getOrLoadRemoteFile(filename, function(file) {
        window.switchToFile(file);
        Storage.set('previouslyOpenedFile', filename, function() {
            console.log('filename (hopefully) set in storage');
        });
    });
}

function openLocalFile() {
    chrome.fileSystem.chooseFile(function(fileEntry) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            return;
        }
        fileEntry.file(function(f) {
            var reader = new FileReader();
            reader.onload = function() {
                var file;
                if (window.files.hasOwnProperty(fileEntry.name)) {
                    file = window.files[fileEntry.name];
                } else {
                    file = new LocalFile(fileEntry, reader.result);
                    files[fileEntry.name] = file;
                }
                window.switchToFile(file);
            };
            reader.readAsText(f);
        });
    });
}

