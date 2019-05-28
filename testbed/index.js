var canvas = document.getElementById("renderCanvas"); // Get the canvas element


const visualize = initVisualize(canvas);


const valuesTest = [
	[new Date('2019-5-25T13:20:00').valueOf(), 14, 59, 90],
	[new Date('2019-5-25T14:20:00').valueOf(), 14, 59, 88],
	[new Date('2019-5-25T15:20:00').valueOf(), 15, 59, 88],
	[new Date('2019-5-25T16:20:00').valueOf(), 16, 59, 80],
	[new Date('2019-5-25T17:20:00').valueOf(), 15, 59, 78],
	[new Date('2019-5-25T18:20:00').valueOf(), 16, 59, 72],
	[new Date('2019-5-25T19:20:00').valueOf(), 16, 59, 68],
	[new Date('2019-5-25T20:20:00').valueOf(), 15, 63, 60],
	[new Date('2019-5-25T21:20:00').valueOf(), 13, 72, 48],
	[new Date('2019-5-25T22:20:00').valueOf(), 11, 82, 32],
	[new Date('2019-5-25T23:20:00').valueOf(), 10, 88, 28],
	[new Date('2019-5-26T00:20:00').valueOf(), 9, 87, 10],
	[new Date('2019-5-26T01:20:00').valueOf(), 9, 87, 10],
	[new Date('2019-5-26T02:20:00').valueOf(), 8, 93, 10],
	[new Date('2019-5-26T03:20:00').valueOf(), 9, 87, 10],
	[new Date('2019-5-26T04:20:00').valueOf(), 10, 88, 10],
	[new Date('2019-5-26T05:20:00').valueOf(), 10, 82, 22],
	[new Date('2019-5-26T06:20:00').valueOf(), 11, 82, 34],
	[new Date('2019-5-26T07:20:00').valueOf(), 12, 77, 54],
	[new Date('2019-5-26T08:20:00').valueOf(), 13, 77, 66],
	[new Date('2019-5-26T09:20:00').valueOf(), 15, 68, 78],
	[new Date('2019-5-26T10:20:00').valueOf(), 17, 64, 84],
	[new Date('2019-5-26T11:20:00').valueOf(), 17, 64, 88]
];

const dataTemp = {format: "°C", values:[]};
const dataHumid = {format: "%", values:[]};
const dataLight = {format: "Lux", values:[]};
for(let d of valuesTest)
{
	dataTemp.values.push([d[0],d[1]]);
	dataHumid.values.push([d[0],d[2]]);
	dataLight.values.push([d[0],d[3]]);
}

visualize.addGraph("temp", [1, 0, 0, 1], dataTemp);
visualize.addGraph("humid", [0, 0, 1, 1], dataHumid);
visualize.addGraph("lux", [0, 1, 0, 1], dataLight);
