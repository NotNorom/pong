var paused = true;
var renderer, scene, camera, light, bg, light2;
var bar1, bar2, ball, bb1, bb2, ballbb;
var fieldbbup, fieldbbdown, fieldbbleft, fieldbbright;
var collision = false, leftGoal = false, rightGoal = false;
var spaceFromMid = 650;
var ballMov = new THREE.Vector2(0, 0);
var moveSpeed = 5;
var barHeight = 50;
var scoreBoard = document.getElementById("score");
var pressSpace = document.getElementById("pressToPlay");
var pointsLeft = 0, pointsRight = 0;
var extrudeSettings = {steps: 1, amount: 1, bevelEnabled: false};


// Set the scene size.
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

// Keycode Array
var keys = [];
var keyDown = function(e) {
    keys[e.keyCode] = true;
}
var keyUp = function(e) {
    keys[e.keyCode] = false;
}

init();

makeBG = (function() {
	var geo = new THREE.PlaneBufferGeometry(WIDTH, HEIGHT);
	var mat = new THREE.MeshStandardMaterial({color: "#022839", specular:"#000000", shininess: 0});
	var plane = new THREE.Mesh(geo, mat);
	plane.position.z = -1;
	plane.receiveShadow = true;
	scene.add(plane);
	return plane;
});
bg = makeBG();

bar1 = makeBox("#8acdd0", "shadow");
bar1.scale.set(4,barHeight,1);
bar1.position.x = -spaceFromMid;

bar2 = makeBox("#8acdd0", "shadow");
bar2.scale.set(4,barHeight,1);
bar2.position.x = spaceFromMid;

ball = makeBox("#edf5f5");
ball.scale.set(4, 4, 1);
//ball.position.z = 2;

refreshScoreboard();
update();

// Sets up the camera and scene
function init() {
    // Add event handlers
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    // Set some camera attributes.
    const NEAR = 0.1;
    const FAR = 10000;

    // Get the DOM element to attach to
    const container = document.body;

    // Create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer({antialias: true});

    camera =
          new THREE.OrthographicCamera(
              WIDTH/-2, WIDTH/2, HEIGHT/2, HEIGHT/-2,
              NEAR,
              FAR
          );
	camera.position.z = 10;
	
    scene = new THREE.Scene();
    scene.background = new THREE.Color( "#022839" );
	
	light = new THREE.PointLight(0xffffff, 10, 0, 2);
	light.position.set(0, 0, 1);
	light.castShadow = true;
	
	//Set up shadow properties for the light
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.camera.near = 0.5;      
	light.shadow.camera.far = 2500;
	
	light2 = new THREE.AmbientLight(0xffffff, 0.2);
	
    // Add the camera and light to the scene.
    scene.add(camera);
	scene.add(light);
	scene.add(light2);

    // Start the renderer.
    renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	
    // Attach the renderer-supplied DOM element.
    container.appendChild(renderer.domElement);
    
    // Setting WIDTH and HEIGHT based stuff
    fieldbbup = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, HEIGHT/2, 0), new THREE.Vector3(WIDTH, 30, 10));
    fieldbbdown = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, HEIGHT/-2, 0), new THREE.Vector3(WIDTH, 30, 10));
	fieldbbleft = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(WIDTH/-2, 0, 0), new THREE.Vector3(30, HEIGHT, 10));
	fieldbbright = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(WIDTH/2, 0, 0), new THREE.Vector3(30, HEIGHT, 10));
}

function makeBox(color, shadow) {
    var shape = new THREE.Shape;
	shape.moveTo(-1, -1);
	shape.lineTo(-1, 1);
	shape.lineTo(1, 1);
	shape.lineTo(1, -1);
	shape.lineTo(-1, -1);
	
	var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);	
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var bar = new THREE.Mesh(geometry, material);
	if(shadow === "shadow")	bar.castShadow = true;
    
    bar.position.z = 0;
    scene.add(bar);
    return bar;
}

function update() {
	// Draw!
	renderer.render(scene, camera);   	
	if(!paused) {
		ball.position.x += ballMov.x;
		ball.position.y += ballMov.y;
		light.position.x = ball.position.x;
		light.position.y = ball.position.y;
		collisionHandler();    
		movementUpdate();
	}	
	else {		
		if(keys[32]) {
			paused = false;
			makeBallMove();
			pressSpace.className = "hidden";
		}
	}
	// Schedule the next frame.
	requestAnimationFrame(update);
}

function makeBallMove() {
	ballMov.x = Math.random();
	ballMov.y = Math.random()*0.5;
	ballMov.normalize();
	ballMov.multiplyScalar(5);
}

function collisionHandler() {
	setBoundingBoxes();
	collisionBar = bb1.intersectsBox(ballbb) || bb2.intersectsBox(ballbb);
	if(collisionBar) {ballMov.x = -ballMov.x; ballMov.multiplyScalar(1.1);} 
	collisionField = ballbb.intersectsBox(fieldbbup) || ballbb.intersectsBox(fieldbbdown);
	if(collisionField) {ballMov.y = -ballMov.y; ballMov.multiplyScalar(1.1);} 
	
	leftGoal = ballbb.intersectsBox(fieldbbleft);
	rightGoal = ballbb.intersectsBox(fieldbbright);
	if(leftGoal) score("right");
	else if(rightGoal) score("left");
}

function score(whosePoints) {
	if(whosePoints === "left") pointsLeft++;	
	else pointsRight++;
	refreshScoreboard();
	ballMov.multiplyScalar(0);
	ball.position.x = 0;
	ball.position.y = 0;
	light.position.x = 0;
	light.position.y = 0;
	paused = true;
	pressSpace.className = "";
}

function refreshScoreboard() {
	scoreBoard.innerHTML = pointsLeft + "  <span class='blue'>-</span>  " + pointsRight;
}

function movementUpdate() {
    if (keys[87] && !bb1.intersectsBox(fieldbbup)){ // w
        bar1.translateY(moveSpeed);
    }
    if (keys[83] && !bb1.intersectsBox(fieldbbdown)) { // s
        bar1.translateY(-moveSpeed); 
    }
    if (keys[38] && !bb2.intersectsBox(fieldbbup)){ // up
        bar2.translateY(moveSpeed);
    }
    if (keys[40] && !bb2.intersectsBox(fieldbbdown)) { // down
        bar2.translateY(-moveSpeed); 
    }
}

function setBoundingBoxes() {
    bb1 = new THREE.Box3().setFromObject(bar1);
    bb2 = new THREE.Box3().setFromObject(bar2);
    ballbb = new THREE.Box3().setFromObject(ball);
}
