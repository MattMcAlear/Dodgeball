function startGame(){
	// set the scene size
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

	// get the DOM element to attach to
	// - assume we've got jQuery to hand
	var $container = $('#container');
	
	balls = [];

	// create a WebGL renderer, camera
	// and a scene
	var renderer = new THREE.WebGLRenderer();
	var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	var scene = new THREE.Scene();

	// the camera starts at 0,0,0 so pull it back
	camera.position.z = 300;
	camera.position.y = 200;
	camera.rotation.x = 100;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);
	// enable shadows on the renderer
	//renderer.shadowMapEnabled = true;

	// attach the render-supplied DOM element
	$container.append(renderer.domElement);

	// create the sphere's material
	var sphereMaterial = new THREE.MeshLambertMaterial(
	{
		color: 0xCC0000
	});

	// set up the sphere vars
	var radius = 50, segments = 16, rings = 16;

	// create a new mesh with sphere geometry -
	// we will cover the sphereMaterial next!
	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, rings),
		sphereMaterial);

	// create the sphere's material
	var cubeMaterial = new THREE.MeshLambertMaterial(
	{
		color: 0xCC0000
	});

	// set up the cube vars
	var width = 50, height = 50, depth = 100;

	var cube = new THREE.Mesh(
		new THREE.CubeGeometry(width, height, depth),
		cubeMaterial);

	// enable shadows for an object
	//cube.castShadow = true;
	//cube.receiveShadow = true;
		
	// add the sphere to the scene
	scene.add(cube);

	// sphere geometry
	sphere.geometry
			
	// it's attributes
	sphere.position.x = 0;
	sphere.rotation.x = 50;
	sphere.scale.y = .5;

	var planeGeo = new THREE.PlaneGeometry(400, 200, 10, 10);
	var planeMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
	var plane = new THREE.Mesh(planeGeo, planeMat);
	plane.rotation.x = -Math.PI/2;
	plane.position.y = -25;
	plane.receiveShadow = true;
	scene.add(plane);

	// add the sphere to the scene
	scene.add(sphere);

	// and the camera
	scene.add(camera);

	// create a point light
	var pointLight = new THREE.PointLight( 0xFFFFFF );

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 40;
	pointLight.position.z = 130;
	
	// enable shadows for a light
	//pointLight.castShadow = true;

	// add to the scene
	scene.add(pointLight);	
	/*
	// model
	var loader = new THREE.ColladaLoader();
	loader.load('worldData/glMap.dae', function (result) {
	  scene.add(result.scene);
	});
	*/
	
	/*
	var loader = new THREE.OBJMTLLoader();
	loader.addEventListener( 'load', function ( event ) {

		modelObject = event.content;

		modelObject.position.y = - 80;
		scene.add( modelObject );

	});
	loader.load( 'http://localhost/Dodgeball/worldData/glMap.obj', 'http://localhost/Dodgeball/worldData/glMap.mtl' );
	*/
	
	
	loader.load( "http://localhost/Dodgeball/testthreejs.json", function( geometry ) {
		
		mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
		scene.add( mesh );
		
	} );

	            
	var controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = 100;
	controls.lookSpeed = 0.1;
	controls.lon = -70; //Make camera look towards initial objects.
	//controls.noFly = true;
	var clock = new THREE.Clock();
	
	// Stop moving around when the window is unfocused
	$(window).bind('focus', function() {
		if (controls) controls.freeze = false;
	});
	$(window).bind('blur', function() {
		if (controls) controls.freeze = true;
	});

	// Draw
	function renderLoop() {
		requestAnimationFrame(renderLoop);
		var clockDelta = clock.getDelta();
		
		if (controls.fire){
			controls.fire = false;
			scene.add(fireBall(balls, camera));
		}
				
		var ballsToRemove = moveBalls(balls, clockDelta);
		for (var i in ballsToRemove){
			var ball = ballsToRemove[i];
			scene.remove(ball.obj);
		}
		
		controls.update(clockDelta);
		applyGravity(camera, clockDelta);
		
		cube.rotation.x += 0.05;
		cube.rotation.y += 0.05;
		renderer.render(scene, camera);
	}
	renderLoop();
}

function applyGravity(object, delta){
	var floor = 25;
	if (object.position.y <= floor){
		return;
	}
	
	var gravityRate = 100;
	object.translateY((-gravityRate) * delta);
}

function fireBall(balls, camera){
	var sphereMaterial = new THREE.MeshLambertMaterial(
	{
		color: 0x0000CC
	});

	var radius = 20, segments = 16, rings = 16;

	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, rings),
		sphereMaterial
	);
	
	sphere.position.x = camera.position.x;
	sphere.position.y = camera.position.y;
	sphere.position.z = camera.position.z;
	
	var vDirection = new THREE.Vector3( 0, 0, -1 );
	vDirection.applyQuaternion( camera.quaternion );
	
	var ball = game.createEntity(
	{
		name: 		"Ball",
		obj:		sphere,
		direction:	vDirection,
		age:		0
	}, 
	[
		game.component.entity,
        game.component.takesGravity
	]);
	
	balls.push(ball);
	
	return sphere;
}

function moveBalls(balls, delta){
	var removeBalls = [];
	var ballspeed = 5;
	
	for (var i in balls){
		var ball = balls[i];
		
		ball.obj.translateOnAxis(ball.direction, ballspeed);
		ball.applyGravity(delta);
		
		ball.age += delta;
		
		if (ball.obj.position.y < 0 || ball.age > 15){
			delete balls[i];
			removeBalls.push(ball);
		}
	}
	
	return removeBalls;
}

// componentSystem.js
(function() {

    window.game = {};
    game.component = {};

    game.createEntity = function(properties, components) {

        var prop;
        var entity = {};

        for (prop in properties) {
            entity[prop] = properties[prop];
        }

        components.forEach(function(component) {
            for (prop in component) {
                if (entity.hasOwnProperty(prop)) {
                    throw "Entity property conflict! " + prop;
                }
                entity[prop] = component[prop];
            }
        });

        return entity;

    }

}());

// entity.js
(function() {

    game.component.entity = {
        distanceTo: function(x, y) {
            return Math.sqrt(Math.pow(x - this.x, 2) +
                             Math.pow(y - this.y, 2));
        }
    }

}());

// moveable.js
(function() {

    game.component.moveable = {
        move: function(x, y) {
            this.x = x;
            this.y = y;
        }
    }

}());


(function() {
	var gravityRate = 50;
	
    game.component.takesGravity = {
        applyGravity: function(delta) {
			this.obj.translateY((-gravityRate) * delta);
        }
    }

}());
