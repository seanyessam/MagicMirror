Module.register("MMM-busRoutes", {
	// Module config defaults.
	defaults: {
		updateInterval: 10000,
		nextStop: "",
		url: "https://transport.tamu.edu/busroutes/Routes.aspx?r=",
		route: "01",
		scrapeDict: {},
		busStops: ""
	},

	// Define start sequence.
	start: function () {
		// Log.info("Starting module: " + this.name);
		// Schedule update timer.
		setInterval(() => {
			this.sendSocketNotification('CONFIG', this.config);
		}, this.config.updateInterval);

		this.sendSocketNotification('CONFIG', this.config);

		// let payload = {
		// 	module: this.name, 
		// 	path: "MMM-busRoutes", 
		// 	actions: {   
		// 		actionName: { 
		// 			notification: "CONFIG"
		// 		},
		// 	}
		//   };
		//   this.sendNotification("REGISTER_API", payload);
	},

	// process data received from socketNotificationReceived (from node_helper.js)
	processData: function (data) {

		this.config.count = data;

		this.updateDom();

	},

	// Override dom generator.
	getDom: function () {

		var wrapper = document.createElement("div");
		var p = document.createElement("pre");
		// var table = document.createElement("table");
		// table.className = "small";
		// wrapper.style = "margin-right: 50px"
		// table.style = "table-layout: auto; width: 130%; border-collapse: collapse;"

		// const headingRow = document.createElement("tr");
		
		// for (var i = 0; i < this.config.scrapeDict["busStops"].length; i++) {
		// 	const th = document.createElement("th");
		// 	th.innerHTML = this.config.scrapeDict["busStops"][i];
		// 	headingRow.appendChild(th);
		// }

		// table.appendChild(headingRow);	

		// for (var i = 0; i < this.config.scrapeDict["busTimes"].length; i++) {

		// 	var row = document.createElement("tr");
		// 	var times = this.config.scrapeDict["busTimes"][i];

		// 	for (var j = 0; j < times.length; j++) {
		// 		var lineCell = document.createElement("td");
		// 		if (this.config.scrapeDict["busTimes"][i][j] == 0) 
		// 			lineCell.innerHTML = ""
		// 		else 
		// 			lineCell.innerHTML = this.config.scrapeDict["busTimes"][i][j];
		// 		row.appendChild(lineCell);
		// 	}

		// 	table.appendChild(row);
		// }
		
		// wrapper.appendChild(this.config.scrapeDict);

		
		// var stops = ""
		// this.config.nextStop.forEach((obj) => {
		// 	stops = stops + obj.nextStop + "<br>"
		//    });
		p.innerText = this.config.busStops;
		//wrapper.innerHTML = this.config.busStops
		wrapper.appendChild(p)
		return wrapper;
	},
	
	socketNotificationReceived: function (notification, payload) {

		if (notification === 'STARTED') {
			console.log("STARTED notification received from node_helper");
			this.updateDom();
		}

		if (notification === 'API') {
			console.log("STARTED notification received from node_helper");
			this.config.busStops = payload;
			this.updateDom();
		}

		if (notification === 'SCRAPED') {
			console.log("SCRAPED")
			console.log(payload)
			this.config.busStops = payload
			console.log(this.config.busStops)
			
			this.updateDom();
		}

    },

});
