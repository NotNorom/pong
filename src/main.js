var paused = true;
var renderer, scene, camera, light, bg, light2, shadow1, shadow2, shadows = [];
var bar1, bar2, ball, bb1, bb2, ballbb, bars = [];
var fieldbbup, fieldbbdown, fieldbbleft, fieldbbright, fieldbbs;
var fieldup, fielddown, fieldleft, fieldright, fields;
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

makeBG = (function() {
	var geo = new THREE.PlaneBufferGeometry(WIDTH, HEIGHT);
	var mat = new THREE.MeshBasicMaterial({color: "#022839"});
	var plane = new THREE.Mesh(geo, mat);
	plane.position.z = -10;
	plane.receiveShadow = true;
	scene.add(plane);
	return plane;
});
bg = makeBG();

bar1 = makeBox("#8acdd0");
bar1.scale.set(4,barHeight,1);
bar1.position.x = -spaceFromMid;
bars.push(bar1);

shadow1 = makeBox("#05131a");
shadow1.position.z = -1;
shadow1.material.side = THREE.DoubleSide;
shadows.push(shadow1);

bar2 = makeBox("#8acdd0");
bar2.scale.set(4,barHeight,1);
bar2.position.x = spaceFromMid;
bars.push(bar2);

shadow2 = makeBox("#05131a");
shadow2.position.z = -1;
shadow2.material.side = THREE.DoubleSide;
shadows.push(shadow2);

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
	
	light = new THREE.PointLight(0xffffff, 10, 0, 1);
	light.position.set(0, 0, 1);
	light.castShadow = false;
	
	//Set up shadow properties for the light
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.camera.near = 0.5;      
	light.shadow.camera.far = 8500;
	
	light2 = new THREE.AmbientLight(0xffffff, 0.2);
	
    // Add the camera and light to the scene.
    scene.add(camera);

    // Start the renderer.
    renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = false;
	
    // Attach the renderer-supplied DOM element.
    container.appendChild(renderer.domElement);
    
    // Setting WIDTH and HEIGHT based stuff
    fieldbbup = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, HEIGHT/2, 0), new THREE.Vector3(WIDTH, 30, 10));
    fieldbbdown = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, HEIGHT/-2, 0), new THREE.Vector3(WIDTH, 30, 10));
	fieldbbleft = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(WIDTH/-2 - 30, 0, 0), new THREE.Vector3(30, HEIGHT*10000000000, 10));
	fieldbbright = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(WIDTH/2 + 30, 0, 0), new THREE.Vector3(30, HEIGHT*10000000000, 10));
	
	/*fields = [];
	for(var i=0; i<4; i++){fields[i] = makeBox("#000000")}
	fields[0].scale.set(WIDTH, 30, 10);
	fields[0].position.set(0, HEIGHT/2, 0);
	fields[1].scale.set(WIDTH, 30, 10);
	fields[1].position.set(0, HEIGHT/-2, 0);
	fields[2].scale.set(30, HEIGHT, 10);
	fields[2].position.set(WIDTH/-2, 0, 0);
	fields[3].scale.set(30, HEIGHT, 10);
	fields[3].position.set(WIDTH/2, 0, 0);
	fields[2].geometry.boundingBox = fieldbbleft;
	fieldbbs = [fieldbbup, fieldbbdown, fieldbbleft, fieldbbright];*/
	
}

function makeBox(color) {
    var shape = new THREE.Shape;
	shape.moveTo(-1, -1);
	shape.lineTo(-1, 1);
	shape.lineTo(1, 1);
	shape.lineTo(1, -1);
	shape.lineTo(-1, -1);
	var geometry = new THREE.ShapeGeometry(shape);	
	//geometry.dynamic = true;
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var bar = new THREE.Mesh(geometry, material);
    
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
		collisionHandler();    
		movementUpdate();
		updateShadows();
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
	
	// For debugging
	if (keys[66]) { //b
		console.log("TEST: \n" + shadow1.geometry.vertices[0].x + " " + shadow1.geometry.vertices[0].y + "\n" +
					shadow1.geometry.vertices[1].x + " " + shadow1.geometry.vertices[1].y + "\n" +
					shadow1.geometry.vertices[2].x + " " + shadow1.geometry.vertices[2].y + "\n" +
					shadow1.geometry.vertices[3].x + " " + shadow1.geometry.vertices[3].y +
					"\n \n");
	}
}

function setBoundingBoxes() {
    bb1 = new THREE.Box3().setFromObject(bar1);
    bb2 = new THREE.Box3().setFromObject(bar2);
    ballbb = new THREE.Box3().setFromObject(ball);
}

function updateShadows() {
	for (var j = 0; j < shadows.length; j++) {
		var directions = [], angles = [], dirObjs = [];
		var bpos = ball.position;
		var barverts = bars[j].geometry.vertices;

		// Get the direction from the ball to the bar edges and
		// sort the direction objects (dir, angle) in ascending angle order
		for (var i = 0; i < barverts.length; i++) {
			var vert = barverts[i].clone();
			var dir3D = bars[j].localToWorld(vert).sub(bpos);
			directions[i] = dir3D;
			angles[i] = directions[i].angleTo(new THREE.Vector3(1, 0, 0));
			dirObjs[i] = {
				direction: directions[i],
				angle: angles[i]
			};
		}
		dirObjs.sort(function (a, b) {return a.angle - b.angle});

		// Set the first pair of vertices (bound to the edges of the bat)
		shadows[j].geometry.vertices[1].fromArray(dirObjs[0].direction.clone().add(bpos).toArray());
		shadows[j].geometry.vertices[2].fromArray(dirObjs[3].direction.clone().add(bpos).toArray());

		// Raycast to the field border
		var raycast1 = new THREE.Ray(bpos, dirObjs[0].direction.clone().normalize());
		var raycast2 = new THREE.Ray(bpos, dirObjs[3].direction.clone().normalize());
		var intersects1 = getIntersections(raycast1)[0];
		var intersects2 = getIntersections(raycast2)[0];
		shadows[j].geometry.vertices[0].fromArray(intersects1.toArray());
		shadows[j].geometry.vertices[3].fromArray(intersects2.toArray());
		shadows[j].geometry.verticesNeedUpdate = true;
	}
}

function getIntersections(ray) {
	var intersects = [];
	//if(ray.intersectBox(fieldbbup) != null) intersects.push(ray.intersectBox(fieldbbup));
	//if(ray.intersectBox(fieldbbdown) != null) intersects.push(ray.intersectBox(fieldbbdown));
	if(ray.intersectBox(fieldbbleft) != null) intersects.push(ray.intersectBox(fieldbbleft));
	if(ray.intersectBox(fieldbbright) != null) intersects.push(ray.intersectBox(fieldbbright));
	return intersects;
}

function radToDeg(rad) {
	return radians * (180/Math.PI);
}