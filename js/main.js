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

	var controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = 100;
	controls.lookSpeed = 0.1;
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
	function render() {
		requestAnimationFrame(render);
		
		controls.update(clock.getDelta());
		
		cube.rotation.x += 0.05;
		cube.rotation.y += 0.05;
		renderer.render(scene, camera);
	}
	render();
}