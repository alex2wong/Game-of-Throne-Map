function playback(controller, next) {
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
    map.flyTo(Object.assign(animationOpt, timelines[controller.index].camera));

    map.once('moveend', function () {
        var control = controller;
        // Duration the slide is on screen after interaction
        controller.timer = setTimeout(function () {
            // Increment index, closure?
            control.index = (control.index + 1 === timelines.length) ? 0 : control.index + 1;
            playback(control);
        }, 7000); // After callback, show the location for 3 seconds.
    });
}