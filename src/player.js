var animationInterval = 8000;
function playback(controller, next) {
    if (!controller.playingStory) return;
    if (next == 1) {
        controller.index = (controller.index + 1 === timelines.length) ? 0 : controller.index + 1;
    } else if (next == -1) {
        controller.index = (controller.index - 1 < 0) ? 0 : controller.index - 1;
        // console.warn(`playback.. preIndex: ${controller.index}`)
    }
    console.warn('controller.index: ' + controller.index);

    title.textContent = timelines[controller.index].title;
    description.textContent = `Chap${controller.index}: ` + timelines[controller.index].description;
    if (controller.timer) {
        clearTimeout(controller.timer);
    }

    // highlightBorough(timelines[index].id ? timelines[index].id : '');

    // Animate the map position based on camera properties
    var animationOpt = {
        speed: 0.5, // make the flying slow
        curve: 1
    }
    var cameraOpt = timelines[controller.index].camera;
    var eventPoint = { lon: cameraOpt.center[0], lat: cameraOpt.center[1], radius: 8, color: '#f00' };
    map.flyTo(Object.assign(animationOpt, cameraOpt));
    Mapbox.myTween.paused = true;
    canvasLayer.clear();

    map.once('moveend', function () {
        // render event Point animation
        Mapbox.myTween.get([eventPoint]).to([Object.assign({}, eventPoint, { radius: 16 })], 2000, canvasLayer.redraw);
        Mapbox.myTween.paused = false;
        var control = controller;
        // Duration the slide is on screen after interaction
        controller.timer = setTimeout(function () {
            // Increment index, closure?
            control.index = (control.index + 1 === timelines.length) ? 0 : control.index + 1;
            playback(control);
        }, animationInterval); // After callback, show the location for 3 seconds.
    });
}

var muteBtn = document.querySelector('#muteBtn');
var ncmPlayer = document.querySelector('#player');
muteBtn.addEventListener('click', function() {
    if (ncmPlayer) {
        ncmPlayer.muted = !ncmPlayer.muted;
        // toggle fill style to indicate current mute state.
        muteBtn.style.fill = muteBtn.style.fill === 'rgb(63, 81, 181)' ? 'rgb(199, 199, 199)' : 'rgb(63, 81, 181)';
    }
});
