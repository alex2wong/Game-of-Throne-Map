// mapboxgl.accessToken = false;
var map = window.map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/huangyixiu/cjuo5ww3v1n711eqgmniofos5',
    center: [19.638807, 0.762392],
    zoom: 3.1,
    pitch: 20,
    hash: true
});
map.addControl(new mapboxgl.NavigationControl);

// parameters to ensure the THREE plane is georeferenced correctly on the map
var modelOrigin = [19.638807, 0.762392];
var modelAltitude = 0;
var modelRotate = [Math.PI / 2, 0, 0];
var modelScale = 5.31843220338983e-5;

// transformation parameters to position, rotate and scale the 3D model onto the map
var modelTransform = {
    translateX: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).x,
    translateY: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).y,
    translateZ: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelScale
};

var THREE = window.THREE;

// configuration of the custom layer for a 3D model per the CustomLayerInterface
var customLayer = {
    id: '3d-terrain',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();
        this.map = map;

        // use the Mapbox GL JS map canvas for three.js
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl
        });

        this.terrainLoader = new TerrainLoader({
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer
        });

        this.renderer.autoClear = false;
        this.terrainLoader.initTerrainLayer();
        this.terrainLoader.loadTerrainLayer();
    },
    render: function (gl, matrix) {
        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4().makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
            .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        // sync mapbox matrix with THREE camera.
        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
};

map.on('style.load', function () {
    console.warn('style loaded, adding THREE layer..');
    map.addLayer(customLayer, 'roads labels');
});

var canvasLayer = new Mapbox.CanvasOverlayer({
    map: map,
    shadow: true,
    blurWidth: 4
});
Mapbox.myTween.loop = true;

var title = document.getElementById('location-title');
var description = document.getElementById('location-description');
var preBtn = document.querySelector('#preChapBtn');
var nextBtn = document.querySelector('#nextChapBtn');
var pauseBtn = document.querySelector('#pauseBtn');
var controller = {
    playingStory: true,
    index: 0,
    timer: 0
}

// Events Time Line. refer to https://asoiaf.fandom.com/zh/wiki/Portal:%E5%8E%86%E5%8F%B2
setTimeout(function(){
    playback(controller);
}, 10000);

preBtn.addEventListener('click', function() { if (controller.index - 1 >= 0) playback(controller, -1) });
nextBtn.addEventListener('click', function() { playback(controller, 1) });
pauseBtn.addEventListener('click', function() { 
    controller.playingStory = !controller.playingStory;
    if (controller.playingStory) {
        playback(controller, 1);
        pauseBtn.innerHTML = 'Pause';
    }
    if (!controller.playingStory) pauseBtn.innerHTML = 'Play';
})