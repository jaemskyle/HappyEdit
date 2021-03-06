var Utils = {
    trim: function(s) {
        return s.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}

function addClass(elem, className) {
    if (!elem) {
        return;
    }

    var i;
    var classNames = elem.getAttribute('class') || '';
    classNames = classNames.split(' ');

    for (i = 0; i < classNames.length; i += 1) {
        if (classNames[i] === className) {
            return;
        }
    }

    classNames.push(className);
    elem.setAttribute('class', classNames.join(' '));
}

function hasClass(elem, className) {
    if (!elem) {
        return;
    }

    var i;
    var classNames = elem.getAttribute('class') || '';
    classNames = classNames.split(' ');

    for (i = 0; i < classNames.length; i += 1) {
        if (classNames[i] === className) {
            return true;
        }
    }

    return false;
}

function capFileName(filename, max) {
    var ret = filename;

    if (filename.length > max) {
        var split = filename.split('/');
        if (split.length > 1) {
            var last = split.pop();
            ret = split.join('/').substring(0, max - split[1].length - 4) + '.../' + split[1] + last;
        } else {
            ret = filename.substring(0, max-3) + '...';
        }
    }

    return ret;
}

function removeClass(elem, className) {
    if (!elem) {
        return;
    }

    var i;
    var newClassNames = [];
    var classNames = elem.getAttribute('class') || '';
    classNames = classNames.split(' ');

    for (i = 0; i < classNames.length; i += 1) {
        if (classNames[i] != className) {
            newClassNames.push(classNames[i]);
        }
    }

    elem.setAttribute('class', newClassNames.join(' '));
}

function isNumeric(num) {
    return parseFloat(num).toString() == num;
}

/**
 * Returns if OS is "windows", "mac", "unix" or "linux". Default: "windows".
 */
function getOS() {
    var os = "win";
    if (navigator.appVersion.indexOf("Win")!=-1) os = "windows";
    if (navigator.appVersion.indexOf("Mac")!=-1) os = "mac";
    if (navigator.appVersion.indexOf("X11")!=-1) os = "unix";
    if (navigator.appVersion.indexOf("Linux")!=-1) os = "linux";
    return os;
}

function getMacOrWin() {
    if (getOS() === "mac") {
        return "mac";
    }
    return "win";
}

function getShortcutForCommand(command) {
    var os = getMacOrWin();
    var shortcut = null;

    if (command.shortcut && command.shortcut.hasOwnProperty(os)) {
        shortcut = command.shortcut[os];
        shortcut = shortcut.replace('-', '');
        shortcut = shortcut.replace('Command', '⌘');
        shortcut = shortcut.replace('Shift', '⇧');
    }

    return shortcut;
}

var ajax = {
    get: function(url, callback) {
        var xhr = new XMLHttpRequest();
        var params = params || '';
        xhr.open("GET", url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback(xhr.responseText);
            }
        };

        xhr.send();
    },
    post: function(url, params, callback) {
        var xhr = new XMLHttpRequest();
        var params = params || '';
        xhr.open("POST", url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback(xhr.responseText);
            }
        };

        xhr.send(params);
    }
}
