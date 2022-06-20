"use strict";

//GLOBAL CONSTANTS && VARIABLES
const SS_KEY = "DefaultPlaybackSpeed";
const SPEED_UP = 0.25;
const SPEED_DOWN = -0.25;

var isShiftPressed;
var isMouseOverVideo;
var currentVideoMouseOver;

if(!(sessionStorage.getItem(SS_KEY))) sessionStorage.setItem(SS_KEY, 1); 

//FUNCTIONS 


// Shortcut stuff
    //keyboard shortcuts

const keyboardDownHandler = (e) => {
    const AcceptedKeysCenarios = {
        Equal: SPEED_UP,
        Minus: SPEED_DOWN,
        ShiftLeft: function() { 
            isShiftPressed = true;
        }
    }

    const acceptedKey = AcceptedKeysCenarios[e.code];
    const currentPlaybackSpeed = sessionStorage.getItem(SS_KEY);

    if(acceptedKey && typeof(acceptedKey) === 'number' && ( document.activeElement.constructor.name === 'HTMLVideoElement' || window.location.href.match(/.*instagram.com\/stories/) ) ){
        var newPlaybackValue = Number(currentPlaybackSpeed) + acceptedKey;
        newPlaybackValue = ( newPlaybackValue >= 0 ) ? newPlaybackValue : 0; //Just to make sure the playback won't be less than 0
        sessionStorage.setItem(SS_KEY, newPlaybackValue);
        queryVideos();
    }

    if(acceptedKey && typeof(acceptedKey) === 'function') acceptedKey();

    e.disp

}

const keyboardUpHandler = (e) => {
    const AcceptedKeysCenarios = {
        ShiftLeft: function() { 
            isShiftPressed = false; 
        }
    }

    const acceptedKey = AcceptedKeysCenarios[e.code];

    if(acceptedKey && typeof(acceptedKey) === 'function') acceptedKey();
}
    
    //mouse wheel shortcuts

const wheelSpeedControl = (e) => {
    let adjust = SPEED_DOWN;

    if(e.deltaY < 0 ){
        adjust = SPEED_UP;
    }

    if( ( isMouseOverVideo || window.location.href.match(/.*instagram.com\/stories/) ) && isShiftPressed) adjustSpeed(currentVideoMouseOver, adjust);
}

const mouseMoveHandler = (e) => {
    if(e.target.constructor.name === "HTMLVideoElement"){
        isMouseOverVideo = true;
        currentVideoMouseOver = e.target;
    }
}




//Directly related to video content 

function adjustSpeed(video, adjust){
    video.playbackRate += adjust;
    sessionStorage.setItem(SS_KEY, video.playbackRate);
}

function setSpeedListener(video, adjust){
    //adjust == rate of change to the video (+0.25 || -0.25);
    this.addEventListener("click", (e) => {
        adjustSpeed(video, adjust);
    })//
}

function setPlaybackSpeedChangeListener(){
    this.addEventListener("ratechange", (e) => {
        for(let el = this.parentElement; el != null && el != document; el = el.parentElement){
            const playbackSpeedText = el.querySelector(".playbackSpeedText");
            if(playbackSpeedText ){
                playbackSpeedText.innerText = this.playbackRate.toFixed(2);
                break;
            } 
        }

    })// 
}

function setPlaybackSpeedControllers(video, target, isStoryPage){

    const playbackButton = document.createElement("div")
    const playbackSpeedUpButton = document.createElement("div");
    const playbackSpeedText = document.createElement("div");
    const playbackSpeedDownButton = document.createElement("div");

    playbackButton.className = "playbackButton"
    playbackSpeedUpButton.className = "playbackSpeedButton playbackSpeedUpButton";
    playbackSpeedText.className = "playbackSpeedText";
    playbackSpeedDownButton.className = "playbackSpeedButton playbackSpeedDownButton";

    playbackSpeedDownButton.innerText = "<<";
    playbackSpeedText.innerText = video.playbackRate.toFixed(2);
    playbackSpeedUpButton.innerText = ">>";

    playbackButton.appendChild(playbackSpeedDownButton)
    playbackButton.appendChild(playbackSpeedText)
    playbackButton.appendChild(playbackSpeedUpButton)

    setSpeedListener.call(playbackSpeedUpButton, video, SPEED_UP);
    setSpeedListener.call(playbackSpeedDownButton, video, SPEED_DOWN);

    setPlaybackSpeedChangeListener.call(video);


    if(!isStoryPage){
        target.appendChild(playbackButton);
        video.hasSpeedControllers = true; // custom flag
    }


    //june 3
    console.log(video.hasSpeedControllers);
    
    if(isStoryPage && video.hasSpeedControllers != true){
        const MenuButton = document.querySelector('[aria-label="Menu"]');
        let ButtonsHolder;
        for(let el = MenuButton; el !== video && el.contains(video) == false && el != document && el != null; el = el.parentElement){
            if(el.querySelectorAll("button").length == 3){
                playbackButton.style.top = `${el.getBoundingClientRect().height}px`;
                ButtonsHolder = el;
                break;
            }
        }
        if(!ButtonsHolder) return;

        ButtonsHolder.appendChild(playbackButton);
        video.hasSpeedControllers = true; // custom 
        console.log(video.hasSpeedControllers);

    }
    

}


function enableContextMenu(video){
    video.addEventListener("contextmenu", (e) => {
        if(typeof(e.stopPropagation) === 'function') e.stopPropagation();
        if(typeof(e.cancelBubble) === 'function') e.cancelBubble();
    }, true)

    video.contextMenuEnabled = true; // another custom flag
}

function enableVideoControls(video){
    video.controls = true;
    for( let el = video.parentElement; el != null; el = el.parentElement){
        // Iterates over the parent elements until both IG player and controls are found;

        const Controls = el.querySelector('[aria-label="Control"]');
        const PlayButton = el.querySelector('[aria-label="Play"]');
        const ToggleAudioButton = el.querySelector('[aria-label="Toggle audio"]');

        if(PlayButton && Controls){
            PlayButton.parentElement.remove()
            Controls.style.bottom = "auto";
            ToggleAudioButton.style.display = "none";
            break;
        }
    }

    //Browser native video controls are disabled by default. 
    //For media-control purpose, Instagram adds a layer (that play triangle )
    //covering the entire video. The code removes that extra layer and then enables
    //default video controls back.
}

// Story related functions 
function removeExtraStoryLayer(video){

    //What this part do is to identify the layer that floats above the video preventing certain types of actiosn (e.g. saving it) 
    //but this is the same layers that hold links and stuff, so it would be nice to not just delete it
    try{
        const VideoParentElement = video.parentElement;
        const CancelPopup = VideoParentElement.querySelector('[aria-label="Cancel popup"]'); //the desired layer is actually ancestor of this

        //this loop iterates in a buble-way trying to find the node that holds the said layer
        for(let el = CancelPopup.parentElement; el != VideoParentElement && el != null && el != document && el.parentElement != null; el = el.parentElement){
            if(el.parentElement === VideoParentElement){
                el.style.pointerEvents = "none"; //this allows clicking on links that overlay the video
                // el.remove();
                break;
            }
        }

    }catch(e){}
}

//The part that sets up the video-controls back in the story is included in the css file, actually just:
    // video::-webkit-media-controls { 
    //     display: flex !important;  
    // }


function adjustStoryReplyButton(video){
    //I'm actively avoiding the use of class names 

    const InputArea = document.querySelector("textarea");
    if(InputArea === null) return

    //Instagram calls the info about the story as the following. I'm assuming they will not change it..
    const StoryHeaders = document.querySelector("header");
    const StoryFrame = StoryHeaders.parentElement;

    // Another bubble loop. The assumption is that the reply button and the story headers will have a common parent
     for(let el = InputArea.parentElement; el != StoryFrame && el != document && el != null; el = el.parentElement ){
        
         //very weak safety
         if(el.parentElement.children.length === 3){
             const target = el.parentElement;
             target.style.opacity = "10%";
             target.addEventListener( "mouseover", (e) => target.style.opacity = "100%" );
             target.parentElement.addEventListener( "mouseleave", (e) => target.style.opacity = "10%" );
         }

         if(el.parentElement === StoryFrame){
             el.style =  'margin-bottom: 80px; background: transparent; ';
             break;
         }
     }

}

//The functions that does the job
function queryVideos(){
    document.querySelectorAll("video").forEach( (video) => {

        const isStoryPage = window.location.href.match(/^.*instagram\.com\/stories\/.*/);
        const isHighlight = window.location.href.match(/.*instagram.com\/stories\/highlights\/.*/);
        
        //Story posts be like
        if(isStoryPage && video.querySelector("source") && video.storyConfigSet != true){
            removeExtraStoryLayer(video);

            if(!isHighlight){
                adjustStoryReplyButton(video);
                console.log("Not an highlight");
            }

            video.storyConfigSet = true;
        }
        video.playbackRate = sessionStorage.getItem(SS_KEY);

        if(video.contextMenuEnabled != true) enableContextMenu(video);
        if(!video.controls) enableVideoControls(video);
        if(video.hasSpeedControllers != true) setPlaybackSpeedControllers(video, video.parentElement, isStoryPage);


    });
}


//  Both changes in DOM and an interval are set to activate the video query.
const Observer = new MutationObserver( (mutations) => {
    mutations.forEach( (mutation) =>{
        try{
            queryVideos(); 
        }catch(e){}
    })
})
const ObserverConfig = {childList: true};
Observer.observe(document.querySelector("body"), ObserverConfig);

window.setInterval( () =>  { 
    queryVideos(); 
    
}, 1000 );

window.addEventListener("keydown", keyboardDownHandler);
window.addEventListener("keyup", keyboardUpHandler);

window.addEventListener("mousemove", mouseMoveHandler);
window.addEventListener("wheel", wheelSpeedControl), {passive: true};
