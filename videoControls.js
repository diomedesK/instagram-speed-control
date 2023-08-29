// ==UserScript==
// @name         Instagram/TikTok speed controls
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A script that enables speed controls by pressing - and = keys for Instagram and TikTok
// @author       You
// @match        *://*.instagram.com/*
// @match        *://*.tiktok.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        none
// ==/UserScript==


var _PB_STYLE = `
    position: absolute;
    right: 10px;
    color: #fff;
    margin-top: 5%;
    font-size: xx-large;
    display: none;

    -webkit-text-stroke: 1px #000;
`

var PLAYBACK_RATE = 1;
var CURRENT_DOMAIN;

const PLAYBACK_DISPLAYS = [];
const TOUTS = [];
const DOMAINS = {
    instagram: "INSTAGRAM",
    tiktok: "TIKTOK"
}

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
        if( CURRENT_DOMAIN === DOMAINS.instagram && !video.controls){
            video.controls = true;
        }

        if (!video.paused){
            video.playbackRate = PLAYBACK_RATE;
        }

        if(!video.hasRateListener){
            const pb = document.createElement("div");
            pb.innerText = PLAYBACK_RATE;
            pb.className = "pb-display";
            video.parentElement.prepend(pb);

            pb.style = _PB_STYLE;
            PLAYBACK_DISPLAYS.push(pb);

            video.addEventListener("ratechange", (e) => {
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
    let currentURL = new URL(window.location.href)
    if(currentURL.host === "www.tiktok.com"){
        CURRENT_DOMAIN = DOMAINS.tiktok;
    } else if (currentURL.host === "www.instagram.com"){
        CURRENT_DOMAIN = DOMAINS.instagram;
    }

    setInterval( ( () => queryVideos() ) , 1000/4 )
    window.addEventListener("keydown", handleKeyboard);
})();
