/** Z Depth for 2d projection */
const z = -0.7;

const sizes = {
	marginLeft: .015625,
	marginTop: .015625,
	segmentWidth: .46875,
	segmentHeight: .46875,
	clickMarginCorner: 0.35,
	clickMarginSide: 0.4,
};

/** Texture Size */
const texSize = 2048;

/** Display Modes */
const Modes = {
	OVERHEAD: {
		name: 'overhead',
		rotation: new BABYLON.Vector3(
			-0.5 * 32.264 * Math.PI / 180,
			-45 * Math.PI / 180,
			0.5 * 32.264 * Math.PI / 180)
	},
	FRONT: {
		graph: 2,
		texOffset: [0, 1],
		rotation: new BABYLON.Vector3(0, 0, 0),
		isCorner: (x, y) => x < -sizes.clickMarginCorner && y > sizes.clickMarginCorner,
		neighbourTop: () => Modes.TOP,
		neighbourBottom: () => null,
		neighbourLeft: () => Modes.LEFT,
		neighbourRight: () => null
	},
	LEFT: {
		graph: 1,
		texOffset: [0.5, 0.5],
		rotation: new BABYLON.Vector3(0, -90 * Math.PI / 180, 0),
		isCorner: (x, y) => x > sizes.clickMarginCorner && y > sizes.clickMarginCorner,
		neighbourTop: () => Modes.TOP,
		neighbourBottom: () => null,
		neighbourLeft: () => null,
		neighbourRight: () => Modes.FRONT
	},
	TOP: {
		graph: 0,
		texOffset: [0, 0.5],
		rotation: new BABYLON.Vector3(-90 * Math.PI / 180, 0, 0),
		isCorner: (x, y) => x < -sizes.clickMarginCorner && y < -sizes.clickMarginCorner,
		neighbourTop: () => null,
		neighbourBottom: () => Modes.FRONT,
		neighbourLeft: () => Modes.LEFT,
		neighbourRight: () => null
	},
	side: (i) => i === 0 ? Modes.FRONT : i === 1 ? Modes.LEFT : i === 2 ? Modes.TOP : Modes.OVERHEAD
};


/**
 * Initializes the WebGL Visualization
 * @param canvas HTMLCanvasElement
 */
function initVisualize(canvas) {
	// Babylon Setup: Engine, Scene, Lights, Camera
	const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
	const scene = new BABYLON.Scene(engine);
	const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
	const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(-1, -1, -1), scene);
	const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -2), scene);
	camera.setTarget(BABYLON.Vector3.Zero());

	// Display Mode
	let displayMode = Modes.OVERHEAD;
	let isTransitioning = false;

	// Graphs
	let graphs = {
		_count: 0
	};

	/*
	var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	// advancedTexture.isForeground = false;

	var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
	button1.width = "150px";
	button1.height = "40px";
	button1.color = "white";
	button1.cornerRadius = 20;
	button1.background = "green";
	button1.onPointerUpObservable.add(function () {
		alert("you did it!");
	});
	advancedTexture.addControl(button1);

	var text1 = new BABYLON.GUI.TextBlock();
	text1.text = "Hello world";
	text1.color = "white";
	text1.fontSize = 24;
	advancedTexture.addControl(text1);
*/

	// scene.debugLayer.show();


	const cube = buildCubeMesh(scene);
	cube.rotation = displayMode.rotation;
	const {textureScene, drawPlane} = initDynamicTexture(engine, scene, cube);
	const drawContext = drawPlane.getContext();

	scene.onPointerDown = function (evt, pickResult) {
		if (pickResult.hit) {
			const prevMode = displayMode;
			if (displayMode === Modes.OVERHEAD)
				displayMode = Modes.side(Math.floor(pickResult.faceId / 2));
			else if (displayMode.isCorner(pickResult.pickedPoint.x, pickResult.pickedPoint.y))
				displayMode = Modes.OVERHEAD;
			else if (pickResult.pickedPoint.x < -sizes.clickMarginSide)
				displayMode = displayMode.neighbourLeft();
			else if (pickResult.pickedPoint.x > sizes.clickMarginSide)
				displayMode = displayMode.neighbourRight();
			else if (pickResult.pickedPoint.y < -sizes.clickMarginSide)
				displayMode = displayMode.neighbourBottom();
			else if (pickResult.pickedPoint.y > sizes.clickMarginSide)
				displayMode = displayMode.neighbourTop();


			if (displayMode == null)
				displayMode = prevMode;
			if (prevMode !== displayMode) {
				const oldRot = cube.rotation;
				let dif = displayMode.rotation.subtract(oldRot);
				drawContext.clearRect(0, 0, texSize, texSize);
				isTransitioning = true;
				transition(t => {
					cube.rotation = oldRot.add(dif.scale(t));
					isTransitioning = t < 1;
				}, 1000);
			}
		}
	};


	const deg90 = 22.5 * Math.PI / 180;
	scene.actionManager = new BABYLON.ActionManager(scene);
	// manual camera rotation
	/*
	scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
		console.log("keypress: " + evt.sourceEvent.key);
		if (evt.sourceEvent.key === "ArrowLeft") {
			cube.rotation.y += deg90;
		}
		if (evt.sourceEvent.key === "ArrowRight") {
			cube.rotation.y -= deg90;
		}
		if (evt.sourceEvent.key === "ArrowUp") {
			cube.rotation.x += deg90;
		}
		if (evt.sourceEvent.key === "ArrowDown") {
			cube.rotation.x -= deg90;
		}
	}));
	*/

	window.addEventListener("resize", function () {
		engine.resize();
	});

	engine.runRenderLoop(function () {

		if (drawPlane && drawContext)
			if (isTransitioning) {
				drawPlane.getContext().clearRect(0, 0, texSize, texSize);
				drawPlane.update();
			}
			else if (displayMode === Modes.OVERHEAD) {
				drawContext.clearRect(0, 0, texSize, texSize);
			}
			else if (displayMode.graph < graphs._count) {
				drawContext.clearRect(0, 0, texSize, texSize);
				let update = true;
				const pickResult = scene.pick(scene.pointerX, scene.pointerY);
				if (pickResult.pickedPoint) {
					let clicked_x = 0.5 + pickResult.pickedPoint.x;
					let clicked_y = 0.5 + pickResult.pickedPoint.y;
					let cursorX = (displayMode.texOffset[0] + clicked_x / 2) * texSize | 0;
					let cursorY = (displayMode.texOffset[1] - clicked_y / 2) * texSize | 0;
					let boundsLeft = displayMode.texOffset[0] * texSize;
					let boundsRight = (displayMode.texOffset[0] + .5) * texSize;

					let targetDM;
					let renderPoint = [];
					if (displayMode.isCorner(pickResult.pickedPoint.x, pickResult.pickedPoint.y))
					{
						targetDM = Modes.OVERHEAD;
						renderPoint = [displayMode.texOffset[0]+.05, displayMode.texOffset[1]-0.25];
					}
					else if (pickResult.pickedPoint.x < -sizes.clickMarginSide)
					{
						targetDM = displayMode.neighbourLeft();
						renderPoint = [displayMode.texOffset[0]+.05, displayMode.texOffset[1]-0.25];
					}
					else if (pickResult.pickedPoint.x > sizes.clickMarginSide)
					{
						targetDM = displayMode.neighbourRight();
						renderPoint = [displayMode.texOffset[0]+.45, displayMode.texOffset[1]-0.25];
					}
					else if (pickResult.pickedPoint.y < -sizes.clickMarginSide)
					{
						targetDM = displayMode.neighbourBottom();
						renderPoint = [displayMode.texOffset[0]+.25, displayMode.texOffset[1]-0.05];
					}
					else if (pickResult.pickedPoint.y > sizes.clickMarginSide)
					{
						targetDM = displayMode.neighbourTop();
						renderPoint = [displayMode.texOffset[0]+.25, displayMode.texOffset[1]-0.45];
					}
					if (targetDM) {
						let txt = "GoTo ";
						if (targetDM === Modes.OVERHEAD)
							txt += "Overview";
						else
							txt += graphs[targetDM.graph].name;


						let strWidth = drawContext.measureText(txt).width;

						drawPlane.drawText(txt, renderPoint[0]* texSize - strWidth / 2, renderPoint[1]*texSize, "bold 20px verdana", "white", "transparent");
					}
					else {
						if (clicked_x >= sizes.marginLeft * 2 //&& clicked_x <= 1 - sizes.marginLeft * 2
							&& clicked_y >= sizes.marginTop * 2) {//&& clicked_y <= 1 - sizes.marginTop * 2) {
							let graph = graphs[displayMode.graph];

							let pos = (clicked_x - sizes.marginLeft * 2) / (sizes.segmentWidth * 2);
							let val = graph.findVal(pos);
							let date = new Date(val[0]);

							let strVal = `${val[1].toFixed(2)} ${graph.valueFormat}`;
							let strWidthVal = drawContext.measureText(strVal).width;
							let strTime = `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}`;
							let strWidthTime = drawContext.measureText(strTime).width;
							if (cursorX - strWidthTime / 2 < boundsLeft)
								cursorX = boundsLeft + strWidthTime;
							if (cursorX + strWidthTime / 2 > boundsRight)
								cursorX = boundsRight - strWidthTime;
							let posX = (displayMode.texOffset[0] + sizes.marginLeft + graph.scaleTime(val[0]) * sizes.segmentWidth) * texSize;
							let posY = (displayMode.texOffset[1] - sizes.marginTop - graph.scaleVal(val[1]) * sizes.segmentHeight) * texSize;

							drawContext.beginPath();
							drawContext.moveTo(cursorX, cursorY);
							drawContext.lineTo(posX, posY);
							drawContext.stroke();

							let off = [posY > cursorY ? -24 : 0, posY > cursorY ? 0 : 24];
							drawPlane.drawText(strVal, cursorX - strWidthVal / 2, cursorY + off[0], "bold 20px verdana", "white", "transparent");
							drawPlane.drawText(strTime, cursorX - strWidthTime / 2, cursorY + off[1], "bold 16px verdana", "white", "transparent");
							update = false;
						}
					}
				}
				if (update)
					drawPlane.update();
			}

		scene.render();
	});

	return {
		graphs: graphs,
		addGraph: (name, color, data, maxlength = -1, minVal=null, maxVal=null) => _addGraph(name, color, graphs, data, maxlength, textureScene, minVal, maxVal),
		addToGraph: (name, val) => graphs[name].addVal(val),
		updateGraph: (name, data) => graphs[name].update(data)
	}
}

/**
 * Adds a graph to the visualization.
 * @param name name of the graph
 * @param color color of the graph, as an array [r,g,b,a], values from 0 to 1
 * @param graphs
 * @param data in the format: { format: string, values: [ [time since epoch, number], ... ] }
 *          format is the display format for the value, such as "°C" or "%"
 * @param maxLength
 * @param textureScene
 * @returns created graph object
 */
function _addGraph(name, color, graphs, data, maxLength, textureScene, minVal, maxVal) {
	console.log("Adding graph " + graphs._count + ", '" + name + "'");

	const offsetX = -0.5 + graphs._count % 2 * 0.5 + sizes.marginLeft;
	const offsetY = -Math.floor(graphs._count / 2) * 0.5 + sizes.marginTop;

	createCoordinateSystem(name, offsetX, offsetY, textureScene);

	function determineDomains(values, _minVal, _maxVal) {
		let minVal = _minVal;
		let maxVal = _maxVal;
		let minDate, maxDate = null;
		for (let e of values) {
			if (!minVal && !maxVal)
				minVal = maxVal = e[1];
			else if (minVal > e[1])
				minVal = e[1];
			else if (maxVal < e[1])
				maxVal = e[1];

			if (!minDate && !maxDate)
				minDate = maxDate = e[0];
			else if (minDate > e[0])
				minDate = e[0];
			else if (maxDate < e[0])
				maxDate = e[0];
		}
		let tolerance = .1 * (maxVal - minVal); //10% tolerance
		minVal -= tolerance;
		maxVal += tolerance;
		return {
			domainTime: [minDate, maxDate],
			domainValue: [minVal, maxVal]
		};
	}

	function sortData(data) {
		return data.sort((e1, e2) => e1[0] - e2[0]);
	}

	const domains = determineDomains(data.values, minVal, maxVal);
	console.log(domains);
	const graph = {
		name: name,
		valueFormat: data.format,
		data: sortData(data.values),
		domainTime: null,
		domainValue: null,
		minVal: minVal,
		maxVal: maxVal,
		color: BABYLON.Color4.FromArray(color),
		maxLength: Math.max(data.values.length, maxLength),
		lines: null,
		scaleTime: null,
		scaleVal: null,
		update: null,
		addVal: null,
		findVal: null
	};
	Object.assign(graph, domains);

	graph.scaleVal = function (val) {
		return (val - this.domainValue[0]) / (this.domainValue[1] - this.domainValue[0]);
	};
	graph.scaleTime = function (time) {
		return (time - this.domainTime[0]) / (this.domainTime[1] - this.domainTime[0]);
	};

	function buildLine(graph) {
		let points = [];
		for (let d of graph.data)
			points.push(new BABYLON.Vector3(offsetX + graph.scaleTime(d[0]) * sizes.segmentWidth, offsetY + graph.scaleVal(d[1]) * sizes.segmentHeight, z));
		const lines = BABYLON.MeshBuilder.CreateLines("graph_" + graph.name, {points: points}, textureScene);
		lines.enableEdgesRendering();
		lines.edgesWidth = .3;
		lines.edgesColor = graph.color;
		return lines;
	}

	graph.update = function (data) {
		if (data instanceof Object) {
			if (data.format)
				this.valueFormat = data.format;
			this.data = sortData(data.values);
		}
		else if (data instanceof Array)
			this.data = sortData(data);
		this.maxLength = Math.max(this.data.length, this.maxLength);
		Object.assign(graph, determineDomains(data.values, this.minVal, this.maxVal));
		this.lines.dispose();
		this.lines = buildLine(this);
	};
	graph.addVal = function (val) {
		if (val[0] > this.domainTime[1])
			this.domainTime[1] = val[0];
		if (val[0] < this.domainTime[0])
			this.domainTime[0] = val[0];
		if (val[1] > this.domainValue[1])
			this.domainValue[1] = val[1];
		if (val[1] < this.domainValue[0])
			this.domainValue[0] = val[1];
		this.data.push(val);
		if (this.data.length > this.maxLength) {
			this.data.splice(0, this.data.length - this.maxLength);
			Object.assign(graph, determineDomains(data.values, this.minVal, this.maxVal));
		}
		this.lines.dispose();
		this.lines = buildLine(this);
	};
	graph.findVal = function (x) {
		let searchedDate = this.domainTime[0] + x * (this.domainTime[1] - this.domainTime[0]);
		let idx = -1;
		for (let i in this.data)
			if (this.data[i][0] >= searchedDate)
				if (idx < 0)
					return null;
				else {
					let distLast = searchedDate - this.data[idx][0];
					let distNext = this.data[i][0] - searchedDate;
					// console.log("distLast "+distLast+", distNext: "+distNext);
					if (distLast <= distNext)
						return this.data[idx];
					else
						return this.data[i];
				}
			else
				idx = i;
		return idx < 0 ? null : this.data[idx];
	};
	graph.lines = buildLine(graph);

	graphs[name] = graphs[graphs._count] = graph;
	graphs._count++;
	return graph;
}

function createCoordinateSystem(name, offsetX, offsetY, textureScene) {
	BABYLON.MeshBuilder.CreateLines("border" + name, {
		points: [
			new BABYLON.Vector3(offsetX - sizes.marginLeft, offsetY - sizes.marginTop, z),
			new BABYLON.Vector3(offsetX + sizes.segmentWidth + sizes.marginLeft, offsetY - sizes.marginTop, z),
			new BABYLON.Vector3(offsetX + sizes.segmentWidth + sizes.marginLeft, offsetY + sizes.segmentHeight + sizes.marginTop, z),
			new BABYLON.Vector3(offsetX - sizes.marginLeft, offsetY + sizes.segmentHeight + sizes.marginTop, z),
			new BABYLON.Vector3(offsetX - sizes.marginLeft, offsetY - sizes.marginTop, z)
		]
	}, textureScene);

	const points_coordSys = [
		new BABYLON.Vector3(offsetX - .01, offsetY + sizes.segmentHeight - .01, z),
		new BABYLON.Vector3(offsetX, offsetY + sizes.segmentHeight, z),
		new BABYLON.Vector3(offsetX + .01, offsetY + sizes.segmentHeight - .01, z),

		new BABYLON.Vector3(offsetX, offsetY + sizes.segmentHeight, z),
		new BABYLON.Vector3(offsetX, offsetY, z),
		new BABYLON.Vector3(offsetX + sizes.segmentWidth, offsetY, z),

		new BABYLON.Vector3(offsetX + sizes.segmentWidth - .01, offsetY - .01, z),
		new BABYLON.Vector3(offsetX + sizes.segmentWidth, offsetY, z),
		new BABYLON.Vector3(offsetX + sizes.segmentWidth - .01, offsetY + .01, z)
	];
	BABYLON.MeshBuilder.CreateLines("coordsys" + name, {points: points_coordSys}, textureScene);

}

function buildCubeMesh(scene) {
	const cube = new BABYLON.Mesh("cube", scene);

	const vertices = [
		[-0.5, -0.5, -0.5],
		[0.5, -0.5, -0.5],
		[0.5, 0.5, -0.5],
		[-0.5, 0.5, -0.5],

		[-0.5, -0.5, 0.5],
		[0.5, -0.5, 0.5],
		[0.5, 0.5, 0.5],
		[-0.5, 0.5, 0.5]
	];
	let positions = [];
	positions = positions.concat(vertices[0], vertices[1], vertices[2], vertices[3]);//front

	positions = positions.concat(vertices[4], vertices[0], vertices[3], vertices[7]);//left

	positions = positions.concat(vertices[2], vertices[3], vertices[6], vertices[7]);//top

	const indices = [//012 120 201
		0, 1, 3, 2, 3, 1, //front
		4, 5, 7, 7, 5, 6, //left
		9, 8, 11, 10, 11, 8 //top
	];


	let uvs = [];
	// uvs = uvs.concat([0, 0], [1, 0], [1, 1], [0, 1]); //front
	// uvs = uvs.concat([0, 0], [1, 0], [1, 1], [0, 1]); //left
	// uvs = uvs.concat([1, 0], [0, 0], [1, 1], [0, 1]); //top
	uvs = uvs.concat([0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]); //front
	uvs = uvs.concat([0.5, 0.5], [1, 0.5], [1, 1], [0.5, 1]); //left
	uvs = uvs.concat([0.5, 0.5], [0, 0.5], [0.5, 1], [0, 1]); //top

	const normals = [];
	BABYLON.VertexData.ComputeNormals(positions, indices, normals);

	const vertexData = new BABYLON.VertexData();

	vertexData.positions = positions;
	vertexData.indices = indices;
	vertexData.uvs = uvs;
	vertexData.normals = normals;
	vertexData.applyToMesh(cube);
	// const cube = BABYLON.MeshBuilder.CreateBox("cube", {size: 1}, scene);

	cube.material = new BABYLON.StandardMaterial("Mat", scene);
	return cube;
}

function initDynamicTexture(engine, scene, cube) {
	//Scene, Camera, Light
	const textureScene = new BABYLON.Scene(engine);
	const textureCamera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -1.883), textureScene);
	textureCamera.setTarget(BABYLON.Vector3.Zero());
	const textureLight = new BABYLON.HemisphericLight("texlight1", new BABYLON.Vector3(1, 1, 0), textureScene);
	textureScene.clearColor = BABYLON.Color3.Gray();

	// Init Texture, put on cube's Material
	const renderTexture = new BABYLON.RenderTargetTexture("render", texSize, textureScene, true, false);
	renderTexture.renderList = textureScene.meshes;
	cube.material.diffuseTexture = renderTexture;
	scene.registerBeforeRender(function () {
		renderTexture.render();
	});

	// Create draw plane
	const drawPlane = BABYLON.Mesh.CreatePlane("drawPlane", 1.6, textureScene, false);
	drawPlane.material = new BABYLON.StandardMaterial("drawPlane", textureScene);
	drawPlane.position.z = 50;


	const drawPlaneTexture = new BABYLON.DynamicTexture("drawPlaneTexture", texSize, textureScene, true);
	drawPlaneTexture.hasAlpha = true;
	drawPlane.material.diffuseTexture = drawPlaneTexture;
	drawPlane.material.specularColor = new BABYLON.Color3(0, 0, 0);
	drawPlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	// drawPlane.material.backFaceCulling = false;
	return {textureScene: textureScene, drawPlane: drawPlaneTexture};
}

/*
const borders = BABYLON.MeshBuilder.CreateLines("borders", {
	points: [
		new BABYLON.Vector3(-.5, -.5, z),
		new BABYLON.Vector3(-.5, .5, z),
		new BABYLON.Vector3(.5, .5, z),
		new BABYLON.Vector3(.5, -.5, z)
	]
}, textureScene);

*/


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
