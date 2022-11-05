// ==UserScript==
// @name         Speed
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*.instagram.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        none
// ==/UserScript==

/* coringuei totalmente foda-se, o intagram fica atualizando, nao tem como prever.
 * AGORA VAI SER SIMPLES PORRA*/

var PLAYBACK_RATE = 2;
const PLAYBACK_DISPLAYS = [];
const TOUTS = [];

function handleKeyboard(e){
    switch (e.code){
        case ("Equal"):
            PLAYBACK_RATE += 0.25;
            break;
        case ("Minus"):
            PLAYBACK_RATE -= 0.25;
            break;
    }
}

function queryVideos(){
    document.querySelectorAll("video").forEach( (video) => {
        if (!video.controls) video.controls = true;
        if (!video.paused){
            video.playbackRate = PLAYBACK_RATE;
        }

        if(!video.hasRateListener){
            const pb = document.createElement("div");
            pb.innerText = PLAYBACK_RATE;
            pb.className = "pb-display";
            video.parentElement.prepend(pb);
            PLAYBACK_DISPLAYS.push(pb);

            video.addEventListener("ratechange", (e) => {
                console.log(video.playbackRate);
                PLAYBACK_RATE = video.playbackRate;

                PLAYBACK_DISPLAYS.forEach( (dp) => {
                    dp.innerText = video.playbackRate;
                    dp.style.display = "block";

                    TOUTS.forEach( (t) => {
                        window.clearTimeout(t);
                    })

                    let tout = window.setTimeout( (e) => { dp.style.display = "none"}, 1000);
                    TOUTS.push(tout);
                } )

            })

            video.hasRateListener = true;
        }


    })
}

(function() {
    'use strict';

    setInterval( ( () => queryVideos() ) , 1000/4 )
    window.addEventListener("keydown", handleKeyboard);

    // Your code here...
})();
