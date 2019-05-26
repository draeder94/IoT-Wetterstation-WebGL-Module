var canvas = document.getElementById("renderCanvas"); // Get the canvas element


const visualize = initVisualize(canvas);

const tempData = {
	format: "°C",
	values: [
		[new Date('2019-5-25T13:20:00').valueOf(), 14],
		[new Date('2019-5-25T14:20:00').valueOf(), 14],
		[new Date('2019-5-25T15:20:00').valueOf(), 15],
		[new Date('2019-5-25T16:20:00').valueOf(), 16],
		[new Date('2019-5-25T17:20:00').valueOf(), 15],
		[new Date('2019-5-25T18:20:00').valueOf(), 16],
		[new Date('2019-5-25T19:20:00').valueOf(), 16],
		[new Date('2019-5-25T20:20:00').valueOf(), 15],
		[new Date('2019-5-25T21:20:00').valueOf(), 13],
		[new Date('2019-5-25T22:20:00').valueOf(), 11],
		[new Date('2019-5-25T23:20:00').valueOf(), 10],
		[new Date('2019-5-26T00:20:00').valueOf(), 9],
		[new Date('2019-5-26T01:20:00').valueOf(), 9],
		[new Date('2019-5-26T02:20:00').valueOf(), 8],
		[new Date('2019-5-26T03:20:00').valueOf(), 9],
		[new Date('2019-5-26T04:20:00').valueOf(), 10],
		[new Date('2019-5-26T05:20:00').valueOf(), 10],
		[new Date('2019-5-26T06:20:00').valueOf(), 11],
		[new Date('2019-5-26T07:20:00').valueOf(), 12],
		[new Date('2019-5-26T08:20:00').valueOf(), 13],
		[new Date('2019-5-26T09:20:00').valueOf(), 15],
		[new Date('2019-5-26T10:20:00').valueOf(), 17],
		[new Date('2019-5-26T11:20:00').valueOf(), 17]
	]
};
visualize.addGraph("temp", [1, 0, 0, 1], tempData);
visualize.addGraph("humid", [0, 0, 1, 1], tempData);
visualize.addGraph("lux", [0, 1, 0, 1], tempData);
