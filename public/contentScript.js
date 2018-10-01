function initApplication() {
    var styleTag = document.createElement('link');
    var customStyleTag = document.createElement('style');
    var customScriptTag = document.createElement('script');
    customStyleTag.id = 'custom-css';
    var cssFilePath = chrome.extension.getURL('/static/css/main.css');
    var jsFilePath = chrome.extension.getURL('/static/js/main.js');
    styleTag.setAttribute('href', cssFilePath);
    styleTag.rel = "stylesheet";
    styleTag.type = "text/css";
    styleTag.id = "main-css";
    customScriptTag.id = 'custom-script';
    if (document.querySelector('head')) {
        document.querySelector('head').appendChild(styleTag);
    } else {
        var headNode = document.createElement('head');
        document.querySelector('html').insertBefore(headNode, document.querySelector('body'))
    }
    document.head.appendChild(styleTag);
    document.head.appendChild(customStyleTag);
    document.head.appendChild(customScriptTag);
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', jsFilePath);
    if (document.querySelector('body')) {
        document.querySelector('body').appendChild(scriptTag);
    } else {
        var body = document.createElement('body');
        document.querySelector('html').appendChild(body)
    }
};
const applyOptions = (options) => {
    const themes = {
        default: 'main.css',
        mdn: 'mdn.css'
    }
    const styleNode = document.getElementById('main-css');
    const customScriptNode = document.getElementById('custom-script');
    let cssURL = '';
    if (options.theme === 'default') {
        cssURL = chrome.extension.getURL('/static/css/' + themes[options.theme]);
    } else {
        cssURL = chrome.extension.getURL('/static/css/themes/' + themes[options.theme]);
    }

    if (styleNode.href.indexOf(themes[options.theme] < 0)) {
        styleNode.setAttribute('href', cssURL);
    }
    document.getElementById('custom-css').innerHTML = options.css;
    customScriptNode.innerHTML = 'window.extensionOptions = ' + JSON.stringify(options, null, 2);
    setTimeout((options) => {
        document.getElementById('option-menu').setAttribute('href', options.optionPageURL);
        document.getElementById('option-menu-icon').setAttribute('src', options.optionIconURL);
        document.getElementById('option-menu-icon').style.display = 'block';
    }, 3 * 1000, options);
};

const messageReceiver = () => {
    chrome.runtime.onMessage.addListener((message) => {
        switch (message.action) {
            case 'options_received':
                window.extensionOptions = message.options;
                applyOptions(message.options);
                break;

            default:
                break;
        }
    });
};

messageReceiver();

function isJSONResponsePageOnly() {
    var content = document.body.textContent.trim();
    try {
        JSON.parse(content);
        return true;
    } catch (e) {
        return false;
    }
}
// alternative to DOMContentLoaded event
document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        if (isJSONResponsePageOnly()) {
            chrome.runtime.sendMessage({ action: 'give_me_options' });
            initApplication();
        }
    }
};
