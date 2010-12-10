/*

The MIT License

Copyright (c) 2010 Norio Nomura

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

if (window.top === window) {
(function () {
    var translationWindow = document.createElement('div');
    translationWindow.style.visibility = 'hidden';
    translationWindow.style.backgroundColor = 'InfoBackground';
    translationWindow.style.zIndex = '1000';
    translationWindow.style.position = 'absolute';
    translationWindow.style.width = 'auto'; //width.toString()+'px';
    translationWindow.style.height = 'auto';
    
    function setTranslationWindowRect(rect, useTransform) {
        if (translationWindow.parentNode === null) {
            document.body.appendChild(translationWindow);
        }
        var top = document.body.scrollTop + rect.top;
        var left = document.body.scrollLeft + rect.left;
        var width = rect.width;
        if (useTransform) {
            translationWindow.style.webkitTransitionProperty = 'all';
            translationWindow.style.webkitTransitionDuration = '0.3s';
        }
        translationWindow.style.top = top.toString()+'px';
        translationWindow.style.left = left.toString()+'px';
        translationWindow.style.width = width.toString()+'px';
    }
    
    function setTranslationWindowFontSize(fontSize) {
        if (translationWindow.parentNode === null) {
            document.body.appendChild(translationWindow);
        }
        translationWindow.style.fontSize = fontSize;
    }
    
    function getTranslation(message) {
        if (message.rect) {
            setTranslationWindowRect(message.rect, true);
        }
        if (message.fontSize) {
            translationWindow.style.fontSize = message.fontSize;
        }
        if (message.color) {
            translationWindow.style.color = message.color;
        }
        if (message.backgroundColor) {
            translationWindow.style.backgroundColor = message.backgroundColor;
        }
        if (message.translation) {
            translationWindow.innerHTML = message.translation;
        }
    }
    
    
    var port;   // This is used by Chrome.
    var sendTranslationRequest;
    
    if (typeof(safari) != 'undefined') {
        sendTranslationRequest = function(text, rect) {
                safari.self.tab.dispatchMessage('TranslateWindow', {'text':text, 'rect':rect});
            };
        safari.self.addEventListener('message', function(eventMessage) {
                getTranslation(eventMessage.message);
            }, false);
    } else if (typeof(chrome) != 'undefined') {
        var port = chrome.extension.connect({'name':'TranslateWindow'});
        port.onMessage.addListener(getTranslation);
        sendTranslationRequest = function(text, rect) {
                port.postMessage({'text':text, 'rect':rect});
            };
    }
    
    var mouseOverNode;
    
    function translateMouseOverNode() {
        var range = document.createRange();
        range.setStartBefore(mouseOverNode);
        range.setEndAfter(mouseOverNode);
        rect = range.getBoundingClientRect();
        var rangeString = range.toString();
        if (rangeString != '') {
            sendTranslationRequest(rangeString, rect);
        }
    }
    
    function handleMouseOverEvent(event) {
        if (event.target != translationWindow) {
            var parentNode = event.target.parentNode;
            while (parentNode && parentNode != translationWindow) {
                parentNode = parentNode.parentNode;
            }
            if (parentNode != translationWindow) {
                mouseOverNode = event.target;
                if (translationWindow.style.visibility == 'visible' ) {
                    translateMouseOverNode();
                }
            }
        }
    }
    
    function handleMouseUpEvent(event) {
        var selection = window.getSelection();
        var selectionString = selection.toString();
        if (selectionString != '') {
            var rect = selection.getRangeAt(0).getBoundingClientRect();
            sendTranslationRequest(selectionString, rect);
        } else {
            translationWindow.style.visibility = 'hidden';
            translationWindow.innerHTML = '';
        }
    }
    
    function handleKeyDownEvent(event) {
        if (translationWindow.style.visibility == 'visible' ) {
            translationWindow.style.visibility = 'hidden';
        } else {
            if (event.altKey && event.ctrlKey && event.keyCode == 'D'.charCodeAt(0)) {
                var selection = window.getSelection();
                var selectionString = selection.toString();
                if (selectionString == '') {
                    translateMouseOverNode();
                }
                translationWindow.style.visibility = 'visible';
            }
        }
    }
    
    if (document.body) {
        document.body.appendChild(translationWindow);
    }
    
    document.addEventListener('mouseover', handleMouseOverEvent, false);
    document.addEventListener('mouseup', handleMouseUpEvent, false);
    document.addEventListener('keydown', handleKeyDownEvent, false);
})();
}