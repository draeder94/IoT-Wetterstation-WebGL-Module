const REQUEST = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
};

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const deviceSelect = document.getElementById("devices"); // Get the canvas element

const paramSim = /simulation=([^&]+)/.exec(window.location.href);
const simulationType = paramSim ? paramSim[1] : "random";

const visualize = initVisualize(canvas);

async function fetchDevices() {
	REQUEST.body = JSON.stringify({
		query: `query { deviceQuery{_id,Room} }`,
		variables: null
	});
	await fetch('http://40.89.134.226:4000/graphql', REQUEST)
		.then(r => r.json())
		.then(data => data.data.deviceQuery.forEach(d => {
			let option = document.createElement("option");
			option.value = d._id;
			option.innerText = d.Room;
			deviceSelect.appendChild(option);
		}));
}

async function fetchValues(device) {
	const dataTemp = {format: "°C", values: []};
	const dataHumid = {format: "%", values: []};
	const dataLight = {format: "Lux", values: []};

	REQUEST.body = JSON.stringify({
		query: `query { measurementQuery(DeviceID: "${device}"){Timestamp, Temperature, Humidity, Brightness} }`,
		variables: null
	});
	await fetch('http://40.89.134.226:4000/graphql', REQUEST)
		.then(r => r.json())
		.then(data => data.data.measurementQuery.forEach(m => {
			let timestamp = parseInt(m.Timestamp) * 1000;
			dataTemp.values.push([timestamp, m.Temperature]);
			dataHumid.values.push([timestamp, m.Humidity]);
			dataLight.values.push([timestamp, m.Brightness]);
		})).finally(function () {
			visualize.addGraph("temp", [1, 0, 0, 1], dataTemp, 30, 10, 30);
			visualize.addGraph("humid", [0, 0, 1, 1], dataHumid, 30);
			visualize.addGraph("lux", [0, 1, 0, 1], dataLight, 30);
		});
}

deviceSelect.onchange = function (event) {
	console.log("Select changed!");
	fetchValues(deviceSelect.value);
};

fetchDevices();



//Temp in C, Humidity in %, Light in Lux
const valuesTest = [
	[14, 59, 90],
	[14, 59, 88],
	[15, 59, 88],
	[16, 59, 80],
	[15, 59, 78],
	[16, 59, 72],
	[16, 59, 68],
	[15, 63, 60],
	[13, 72, 48],
	[11, 82, 32],
	[10, 88, 28],
	[9, 87, 10],
	[9, 87, 10],
	[8, 93, 10],
	[9, 87, 10],
	[10, 88, 10],
	[10, 82, 22],
	[11, 82, 34],
	[12, 77, 54],
	[13, 77, 66],
	[15, 68, 78],
	[17, 64, 84],
	[17, 64, 88]
];

const dataTemp = {format: "°C", values: []};
const dataHumid = {format: "%", values: []};
const dataLight = {format: "Lux", values: []};
for (let i in valuesTest) {
	let date = new Date();
	date.setSeconds(date.getSeconds() - (valuesTest.length - i));
	let timestamp = date.valueOf();
	dataTemp.values.push([timestamp, valuesTest[i][0]]);
	dataHumid.values.push([timestamp, valuesTest[i][1]]);
	dataLight.values.push([timestamp, valuesTest[i][2]]);
}


let last = 0;
let prevstep = [0, 0, 0];
let prev = [0, 0, 0];

function updateValues() {
	let date = new Date().valueOf();

	if (simulationType === "replace") { //Replace; Graph durch Verschobenen Graphen ersetzen
		dataTemp.values.push([date, valuesTest[last][1]]);
		dataHumid.values.push([date, valuesTest[last][1]]);
		dataLight.values.push([date, valuesTest[last][1]]);

		dataTemp.values.splice(0, 1);
		dataHumid.values.splice(0, 1);
		dataLight.values.splice(0, 1);
		visualize.updateGraph("temp", dataTemp);
		visualize.updateGraph("humid", dataHumid);
		visualize.updateGraph("lux", dataLight);
	} else if (simulationType === "cycle") { //Default; Wert von vorne zufügen
		visualize.addToGraph("temp", [date, valuesTest[last][0]]);
		visualize.addToGraph("humid", [date, valuesTest[last][1]]);
		visualize.addToGraph("lux", [date, valuesTest[last][2]]);
	} else { //Default; Zuffalswert
		const flip = Math.random() * 5 > 3;

		if (flip)
			for (let i = 0; i < 3; i++)
				prevstep[i] *= -1;

		const randomTemp = Math.random() * 28;
		const randomHumid = 30 + Math.random() * 70;
		const randomLight = 0.02 + Math.random() * 80000;

		visualize.addToGraph("temp", [date, randomTemp]);
		visualize.addToGraph("humid", [date, randomHumid]);
		visualize.addToGraph("lux", [date, randomLight]);
	}

	last = (last + 1) % valuesTest.length;
	setTimeout(updateValues, 1000);
}

// setTimeout(updateValues, 5000);
