var paused = true;
var renderer, scene, camera;
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

bar1 = makeBox("#8acdd0");
bar1.scale.set(5,barHeight,1);
bar1.position.x = -spaceFromMid;

bar2 = makeBox("#8acdd0");
bar2.scale.set(5,barHeight,1);
bar2.position.x = spaceFromMid;

ball = makeBox("#edf5f5");
ball.scale.set(4, 4, 1);

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
    renderer = new THREE.WebGLRenderer();

    camera =
          new THREE.OrthographicCamera(
              WIDTH/-2, WIDTH/2, HEIGHT/2, HEIGHT/-2,
              NEAR,
              FAR
          );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( "#022839" );

    // Add the camera to the scene.
    scene.add(camera);

    // Start the renderer.
    renderer.setSize(WIDTH, HEIGHT);

    // Attach the renderer-supplied
    // DOM element.
    container.appendChild(renderer.domElement);
    
    // Setting WIDTH and HEIGHT based stuff
    fieldbbup = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, HEIGHT/2, -10), new THREE.Vector3(WIDTH, 1, 10));
    fieldbbdown = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, HEIGHT/-2, -10), new THREE.Vector3(WIDTH, 1, 10));
	fieldbbleft = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(WIDTH/-2, 0, -10), new THREE.Vector3(1, HEIGHT, 10));
	fieldbbright = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(WIDTH/2, 0, -10), new THREE.Vector3(1, HEIGHT, 10));
}

function makeBox(color) {
    var geometry = new THREE.BufferGeometry();
    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    var vertices = new Float32Array( [
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,

        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0
    ] );
    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var bar = new THREE.Mesh( geometry, material );
    
    bar.position.z = -10;
    scene.add(bar);
    return bar;
}

function update() {
	// Draw!
	renderer.render(scene, camera);   	
	if(!paused) {
		ball.position.x += ballMov.x;
		ball.position.y += ballMov.y;
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
	if(collisionBar) ballMov.x = -ballMov.x;
	collisionField = ballbb.intersectsBox(fieldbbup) || ballbb.intersectsBox(fieldbbdown);
	if(collisionField) ballMov.y = -ballMov.y;
	
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
