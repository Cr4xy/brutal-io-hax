// ==UserScript==
// @name         Brutal.io HACK
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Cr4xy
// @match        https://brutal.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=brutal.io
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    // https://gist.github.com/x0a/a78f6cebe3356c35a44e88b371f3a03a
    (function(){
        // https://stackoverflow.com/a/59518023
        if (document.head) {
            throw new Error('Head already exists - make sure to enable instant script injection');
        }

        if("onbeforescriptexecute" in document) return; // Already natively supported

        let scriptWatcher = new MutationObserver(mutations => {
            for(let mutation of mutations){
                for(let node of mutation.addedNodes){
                    if(node.tagName === "SCRIPT"){
                        let syntheticEvent = new CustomEvent("beforescriptexecute", {
                            detail: node,
                            cancelable: true
                        })
                        // .dispatchEvent will execute the event synchrously,
                        // and return false if .preventDefault() is called
                        if(!document.dispatchEvent(syntheticEvent)){
                            node.remove();
                        }
                    }
                }
            }
        })
        scriptWatcher.observe(document.documentElement, {
            childList: true,
            subtree: true
        })
    })();

    document.addEventListener('beforescriptexecute', e => {
        if (e.detail.innerText.includes("(function(n,t,q)")) {
            e.detail.src = "http://127.0.0.1:1336/mod.js";
            e.textContent = "";
            console.log("Prevented execution of original game script");
        }
    }, true);
})();