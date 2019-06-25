const GRAPHQL_URL = "http://40.89.134.226:4000/";
const REQUEST = {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"Accept": "application/json"
	}
};

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const deviceSelect = document.getElementById("devices"); // Get the canvas element

const paramSim = /simulation=([^&]+)/.exec(window.location.href);
const simulationType = paramSim ? paramSim[1] : "random";

const maxLength = 100;

const visualize = initVisualize(canvas);
visualize.addGraph("temp", [1, 0, 0, 1], {format: "°C", values: []}, maxLength, 22, 36);
visualize.addGraph("humid", [0, 0, 1, 1], {format: "%", values: []}, maxLength, 20, 40);
visualize.addGraph("lux", [0, 1, 0, 1], {format: "Lux", values: []}, maxLength);

async function fetchDevices() {
	REQUEST.body = JSON.stringify({
		query: "query { deviceQuery{_id,Address,Building,Floor,Room} }",
		variables: null
	});
	await fetch(GRAPHQL_URL + "graphql", REQUEST)
		.then(r => r.json())
		.then(data => data.data.deviceQuery.forEach(d => {
			let option = document.createElement("option");
			option.value = d._id;
			option.innerText = `${d.Address}/${d.Building ? d.Building + "/" : ""}${d.Floor ? d.Floor + "/" : ""}${d.Room}`;
			deviceSelect.appendChild(option);
		}));
}

async function fetchValues(device) {
	const dataTemp = [];
	const dataHumid = [];
	const dataLight = [];

	let startDate = new Date();
	startDate.setSeconds(startDate.getSeconds() - (maxLength * 5));
	REQUEST.body = JSON.stringify({
		query: `query { measurementQuery(DeviceID: "${device}", startDate: "${startDate.valueOf() / 1000}"){Timestamp, Temperature, Humidity, Brightness} }`,
		variables: null
	});
	await fetch(GRAPHQL_URL + "graphql", REQUEST)
		.then(r => r.json())
		.then(data => {
			const array = data.data.measurementQuery;
			console.log("retrieved " + array.length + " entries");
			let start = Math.max(0, array.length - maxLength);
			for (let i = start; i < array.length; i++) {
				let m = array[i];
				// console.log(m);
				let timestamp = parseInt(m.Timestamp) * 1000;
				dataTemp.push([timestamp, m.Temperature]);
				dataHumid.push([timestamp, m.Humidity]);
				dataLight.push([timestamp, m.Brightness]);
			}
		}).finally(function () {
			visualize.updateGraph("temp", dataTemp);
			visualize.updateGraph("humid", dataHumid);
			visualize.updateGraph("lux", dataLight);

			openGQLSocket(device, data => {
				let timestamp = parseInt(data.measurementAdded.Timestamp) * 1000;
				visualize.addToGraph("temp", [timestamp, data.measurementAdded.Temperature]);
				visualize.addToGraph("humid", [timestamp, data.measurementAdded.Humidity]);
				visualize.addToGraph("lux", [timestamp, data.measurementAdded.Brightness]);
			}, error => {
				console.log("error:");
				console.log(error);
			});
		});
}

deviceSelect.onchange = function (event) {
	console.log("Select changed!");
	fetchValues(deviceSelect.value);
};

fetchDevices().then(() => fetchValues(deviceSelect.value));


const GQL = {
	CONNECTION_INIT: "connection_init",
	CONNECTION_ACK: "connection_ack",
	CONNECTION_ERROR: "connection_error",
	CONNECTION_KEEP_ALIVE: "ka",
	START: "start",
	STOP: "stop",
	CONNECTION_TERMINATE: "connection_terminate",
	DATA: "data",
	ERROR: "error",
	COMPLETE: "complete",
	CURRENT_ID: 1
};

function openGQLSocket(deviceid, callback, error,) {
	const websocket = new WebSocket("ws://40.89.134.226:4000/subscriptions", "graphql-ws");

	websocket.onmessage = function (event) {
		const data = JSON.parse(event.data);

		switch (data.type) {
			case GQL.CONNECTION_ACK: {
				console.log("Websocket connection established for device " + deviceid);
				websocket.send(JSON.stringify({
					type: GQL.START,
					id: (GQL.CURRENT_ID++).toString(),
					payload: {
						query: `subscription { measurementAdded(DeviceID: "${deviceid}"){DeviceID, Timestamp, Temperature, Humidity, Brightness} }`
					}
				}));
				break;
			}
			case GQL.CONNECTION_ERROR: {
				console.error(data.payload);
				break;
			}
			case GQL.CONNECTION_KEEP_ALIVE: {
				break;
			}
			case GQL.DATA: {
				// if (data.payload.data.measurementAdded.DeviceID == deviceid)
				callback(data.payload.data);
				break;
			}
			case GQL.ERROR: {
				error(data.payload);
				break;
			}
			case GQL.COMPLETE: {
				break;
			}
		}
	};

	websocket.onopen = function (event) {
		websocket.send(JSON.stringify({type: GQL.CONNECTION_INIT}));
	};

}
