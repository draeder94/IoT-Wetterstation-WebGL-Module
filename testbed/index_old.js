

var canvas = document.getElementById("renderCanvas"); // Get the canvas element


var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

/******* Add the create scene function ******/
// var createScene;
// createScene = function () {

	// Create the scene space
var scene = new BABYLON.Scene(engine);

// Add a camera to the scene and attach it to the canvas
// var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 12, -16), scene);
// camera.setTarget(BABYLON.Vector3.Zero());

// Add lights to the scene
var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);


// Add a camera to the scene and attach it to the canvas
const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -2), scene);
camera.setTarget(BABYLON.Vector3.Zero());
// camera.attachControl(canvas, true);

const z = -0.7;
const texSize = 2048;

// 	const pointsSys = [
// 		new BABYLON.Vector3(-0.51, 0.49, z),
// 		new BABYLON.Vector3(-0.5, 0.5, z),
// 		new BABYLON.Vector3(-0.49, 0.49, z),
//
// 		new BABYLON.Vector3(-0.5, 0.5, z),
// 		new BABYLON.Vector3(-0.5, -0.5, z),
// 		new BABYLON.Vector3(0.5, -0.5, z),
//
// 		new BABYLON.Vector3(0.49, -0.49, z),
// 		new BABYLON.Vector3(0.5, -0.5, z),
// 		new BABYLON.Vector3(0.49, -0.51, z)
// 	];
// 	const coordinateSystem = BABYLON.MeshBuilder.CreateLines("lines", {points: pointsSys}, scene);
//
var colours = [
	new BABYLON.Color4(1, 1, 1, 1),
	new BABYLON.Color4(1, 0, 0, 1),
	new BABYLON.Color4(0, 1, 0, 1),
	new BABYLON.Color4(0, 0, 1, 1),
	new BABYLON.Color4(1, 1, 0, 1),
	new BABYLON.Color4(0, 1, 1, 1)
];
var uvs = [
	new BABYLON.Vector4(0, 0, 1, 1), //back
	new BABYLON.Vector4(0, 0.5, 0.5, 1), //front
	new BABYLON.Vector4(0, 0, 1, 1), //right
	new BABYLON.Vector4(0.5, 0.5, 1, 1), //left
	new BABYLON.Vector4(0, 0, 1, 1), //top
	new BABYLON.Vector4(0, 0, 1, 1) //bottom
];

// var box = BABYLON.MeshBuilder.CreateBox("box", {width: 1, height: 1, depth: 1, faceUV: uvs}, scene);
var box = new BABYLON.Mesh("custom", scene);


var vertices = [
	[-0.5, -0.5, -0.5],
	[0.5, -0.5, -0.5],
	[0.5, 0.5, -0.5],
	[-0.5, 0.5, -0.5],

	[-0.5, -0.5, 0.5],
	[0.5, -0.5, 0.5],
	[0.5, 0.5, 0.5],
	[-0.5, 0.5, 0.5]
];
var positions = [];
positions = positions.concat(vertices[0], vertices[1], vertices[2], vertices[3]);//front
positions = positions.concat(vertices[4], vertices[5], vertices[6], vertices[7]);//back

positions = positions.concat(vertices[4], vertices[0], vertices[3], vertices[7]);//left

positions = positions.concat(vertices[2], vertices[3], vertices[6], vertices[7]);//top
positions = positions.concat(vertices[0], vertices[1], vertices[4], vertices[5]);//bottom
console.log(positions);

var indices = [
	0, 1, 2, 2, 3, 0, //front
	// 4,7,6, 6,5,4, //back

	8, 9, 11, 11, 9, 10, //left

	12, 14, 13, 13, 14, 15 //top
	// 16,18,17, 17,18,19 //bottom
	//0,4,7, 7,3,0 //left
];

var uvs = [];
uvs = uvs.concat([0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]); //front
uvs = uvs.concat([1, 0], [0, 0], [0, 1], [1, 1]); //back
uvs = uvs.concat([0.5, 0.5], [1, 0.5], [1, 1], [0.5, 1]); //left
uvs = uvs.concat([0.5, 0.5], [0, 0.5], [0.5, 1], [0, 1]); //top
uvs = uvs.concat([0, 1], [1, 1], [0, 0], [1, 0]); //bottom
// 1,1, 0,1, 0,0//,
// 0,0, 0,1, 1,1, 1,1, 1,0, 0,0,
// 0,1, 0,0, 1,0, 0,1, 0,0, 1,0,
//
// 0,1, 0,0, 1,0, 0,1, 0,0, 1,0,
// 0,1, 0,0, 1,0, 0,1, 0,0, 1,0,

var normals = [];
BABYLON.VertexData.ComputeNormals(positions, indices, normals);

var vertexData = new BABYLON.VertexData();

vertexData.positions = positions;
vertexData.indices = indices;
vertexData.uvs = uvs;
vertexData.normals = normals;

vertexData.applyToMesh(box);

const Modes = {
	OVERHEAD: {
		name: 'overhead',
		y: -45 * Math.PI / 180,
		x: -0.5 * 32.264 * Math.PI / 180,
		z: 0.5 * 32.264 * Math.PI / 180
	},
	TEMP: {name: 'temp', y: 0, x: -90 * Math.PI / 180, z: 0},
	HUMID: {name: 'humid', y: -90 * Math.PI / 180, x: 0, z: 0},
	LIGHT: {name: 'light', y: 0, x: 0, z: 0}
};
let displayMode = Modes.OVERHEAD;
box.rotation.x = displayMode.x;
box.rotation.y = displayMode.y;
box.rotation.z = displayMode.z;

var myDynamicTexture = new BABYLON.DynamicTexture("tex", 800, scene);
var myMaterial = new BABYLON.StandardMaterial("Mat", scene);
myMaterial.diffuseTexture = myDynamicTexture;
box.material = myMaterial;

var font = "bold 44px monospace";
myDynamicTexture.drawText("This is a text!!", null, null, font, "#000000", "#ffffff", true);


var ctx = myDynamicTexture.getContext();

const dataTemp = [
	[0, 0]
	// [0,0.1],
	// [0.1,0.25],
	// [0.2,0.1],
	// [0.3,0.05],
	// [0.4,0.4],
	// [0.5,0.3],
	// [0.6,0.6],
	// [0.7,0.7],
	// [0.8,0.8],
	// [0.9,0.7],
];
const dataHumid = [[0, 0], [0, 1]];
const dataLight = [[0, 0]];
const precision = 60;
let prev = Math.random() * 0.25;
for (let i = 0; i < precision; i++) {
	prev += (Math.random() * 1.5 - 0.25) / precision;
	dataTemp.push([i / precision, prev]);
}
prev = Math.random() * 0.25;
for (let i = 0; i < precision; i++) {
	prev += (Math.random() * 1.5 - 0.25) / precision;
	dataHumid.push([i / precision, prev]);
}
prev = Math.random() * 0.25;
for (let i = 0; i < precision; i++) {
	prev += (Math.random() * 1.5 - 0.25) / precision;
	dataLight.push([i / precision, prev]);
}

var textureScene = new BABYLON.Scene(engine);
const textureCamera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -1.89), textureScene);
textureCamera.setTarget(BABYLON.Vector3.Zero());
var texlight1 = new BABYLON.HemisphericLight("texlight1", new BABYLON.Vector3(1, 1, 0), textureScene);
textureScene.clearColor = BABYLON.Color3.Gray();

const borders = BABYLON.MeshBuilder.CreateLines("borders", {
	points: [
		new BABYLON.Vector3(-.5, -.5, z),
		new BABYLON.Vector3(-.5, .5, z),
		new BABYLON.Vector3(.5, .5, z),
		new BABYLON.Vector3(.5, -.5, z)
	]
}, textureScene);

function drawGraph(name, pos, data, color) {
	const offsetX = -0.5 + pos % 2 * 0.5 + .015625;
	const offsetY = -Math.floor(pos / 2) * 0.5 + .015625;
	const points_coordSys = [
		new BABYLON.Vector3(offsetX - .01, offsetY + .46875 - .01, z),
		new BABYLON.Vector3(offsetX, offsetY + .46875, z),
		new BABYLON.Vector3(offsetX + .01, offsetY + .46875 - .01, z),

		new BABYLON.Vector3(offsetX, offsetY + .46875, z),
		new BABYLON.Vector3(offsetX, offsetY, z),
		new BABYLON.Vector3(offsetX + .46875, offsetY, z),

		new BABYLON.Vector3(offsetX + .46875 - .01, offsetY - .01, z),
		new BABYLON.Vector3(offsetX + .46875, offsetY, z),
		new BABYLON.Vector3(offsetX + .46875 - .01, offsetY + .01, z)
	];
	BABYLON.MeshBuilder.CreateLines("coordsys" + pos, {points: points_coordSys}, textureScene);

	let points_graph = [];
	for (let d of data)
		points_graph.push(new BABYLON.Vector3(offsetX + d[0] * .46875, offsetY + d[1] * .46875, z));
	const graph = BABYLON.MeshBuilder.CreateLines("graph_" + name, {points: points_graph}, textureScene);
	graph.enableEdgesRendering();
	graph.edgesWidth = .3;
	graph.edgesColor = color;
	return graph;
}

drawGraph("temp", 0, dataTemp, new BABYLON.Color4(1, 0, 0, 1));
drawGraph("humid", 1, dataHumid, new BABYLON.Color4(0, 0, 1, 1));
drawGraph("light", 2, dataLight, new BABYLON.Color4(0, 1, 0, 1));

var outputplane = BABYLON.Mesh.CreatePlane("outputplane", 1.6, textureScene, false);
outputplane.material = new BABYLON.StandardMaterial("outputplane", textureScene);
// outputplane.position = new BABYLON.Vector3(-1.5, .25, z);
outputplane.material.diffuseColor = BABYLON.Color3.Blue();

var outputplaneTexture = new BABYLON.DynamicTexture("dynamic texture", texSize, textureScene, true);
outputplane.material.diffuseTexture = outputplaneTexture;
// outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
// outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
outputplane.material.backFaceCulling = false;
outputplaneTexture.hasAlpha = true;


var renderTexture = new BABYLON.RenderTargetTexture("render", texSize, textureScene, true, false);
renderTexture.renderList = textureScene.meshes;

myMaterial.diffuseTexture = renderTexture;
scene.registerBeforeRender(function () {
	renderTexture.render();
});

myDynamicTexture.update();

const deg90 = 22.5 * Math.PI / 180;
scene.actionManager = new BABYLON.ActionManager(scene);

scene.onPointerDown = function (evt, pickResult) {
	// if the click hits the ground object, we change the impact position
	if (pickResult.hit) {
		// console.log(pickResult.pickedPoint);
		// if(false)
		const prevMode = displayMode;

		if (displayMode === Modes.OVERHEAD)
			switch (pickResult.faceId) {
				case 0:
				case 1:
					displayMode = Modes.LIGHT;
					break;
				case 2:
				case 3:
					displayMode = Modes.HUMID;
					break;
				case 4:
				case 5:
					displayMode = Modes.TEMP;
					break;
			}
		else if (displayMode === Modes.TEMP) {
			if (pickResult.pickedPoint.x < -.4 && pickResult.pickedPoint.y < -.4)
				displayMode = Modes.OVERHEAD;
			else if (pickResult.pickedPoint.x < -.45)
				displayMode = Modes.HUMID;
			else if (pickResult.pickedPoint.y < -.45)
				displayMode = Modes.LIGHT;
		}
		else if (displayMode === Modes.HUMID) {
			if (pickResult.pickedPoint.x > .4 && pickResult.pickedPoint.y > .4)
				displayMode = Modes.OVERHEAD;
			else if (pickResult.pickedPoint.x > .45)
				displayMode = Modes.LIGHT;
			else if (pickResult.pickedPoint.y > .45)
				displayMode = Modes.TEMP;
		}
		else if (displayMode === Modes.LIGHT) {
			if (pickResult.pickedPoint.x < -.4 && pickResult.pickedPoint.y > .4)
				displayMode = Modes.OVERHEAD;
			else if (pickResult.pickedPoint.x < -.45)
				displayMode = Modes.HUMID;
			else if (pickResult.pickedPoint.y > .45)
				displayMode = Modes.TEMP;
		}

		if (prevMode !== displayMode) {
			let oldX = box.rotation.x;
			let oldY = box.rotation.y;
			let oldZ = box.rotation.z;
			let difX = displayMode.x - oldX;
			let difY = displayMode.y - oldY;
			let difZ = displayMode.z - oldZ;
			transition(t => {
				console.log("step: " + t);
				box.rotation.x = oldX + difX * t;
				box.rotation.y = oldY + difY * t;
				box.rotation.z = oldZ + difZ * t;
			}, 1000);
		}
	}
};

textureScene.onPointerDown = function (evt, pickResult) {
	console.log("textureSceneClicked: ");
	console.log(pickResult);
};

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
	console.log("keypress: " + evt.sourceEvent.key);
	if (evt.sourceEvent.key === "ArrowLeft") {
		box.rotation.y += deg90;
	}
	if (evt.sourceEvent.key === "ArrowRight") {
		box.rotation.y -= deg90;
	}
	if (evt.sourceEvent.key === "ArrowUp") {
		box.rotation.x += deg90;
	}
	if (evt.sourceEvent.key === "ArrowDown") {
		box.rotation.x -= deg90;
	}
}));


// const graph = BABYLON.MeshBuilder.CreateLines("graph", {points: points3D, colors: colors}, scene);

// return scene;
// };
/******* End of the create scene function ******/

// var scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
const timestep = 100;
engine.runRenderLoop(function () {

	// let yDif = displayMode.y - box.rotation.y;
	// box.rotation.y += yDif / timestep;
	//
	// let xDif = displayMode.x - box.rotation.x;
	// box.rotation.x += xDif / timestep;
	//
	// let zDif = displayMode.z - box.rotation.z;
	// box.rotation.z += zDif / timestep;

	if(displayMode !== Modes.OVERHEAD) {
		outputplaneTexture.getContext().clearRect(0, 0, texSize, texSize);
		var pickResult = scene.pick(scene.pointerX, scene.pointerY);
		var texcoords = pickResult.getTextureCoordinates();
		if (texcoords) {
			var clicked_x = texcoords.x;
			var clicked_y = texcoords.y;
			var posX = (clicked_x * texSize) | 0;
			var posY = (texSize - clicked_y * texSize) | 0;
			// var rect1 = canvas.upperCanvasEl.getBoundingClientRect();
			// var clientX = posX + rect1.left | 0;
			// var clientY = posY + rect1.top | 0;
			// var evt = document.createEvent("MouseEvents");
			// evt.initMouseEvent(name, true, true, window, 1, screenX, screenY, clientX, clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, canvas.upperCanvasEl);
			// return evt;
			outputplaneTexture.drawText("Some More Text", posX, posY, "bold 24px verdana", "white");
		}
	}

	scene.render();
	// textureScene.render();
});
//
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
	engine.resize();
});

async function transition(func, maxTime) {
	const timeStart = new Date().getTime();
	const step = function () {
		let t = new Date().getTime() - timeStart;
		let stop = false;
		if (t > maxTime) {
			stop = true;
			t = maxTime;
		}
		func(t / maxTime);
		if (!stop)
			requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}
