const NodeHelper = require("node_helper");
const Log = require("logger");
const cheerio = require("cheerio");
const needle = require('needle');

function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function checkDateTime(time) {

    var AMPM = time[time.length - 1];

    var hoursString = time.toString().replace(/\D/g, '').slice(0, 2);
    var minuteString = time.toString().replace(/\D/g, '').slice(2, 4);

    var hoursInt = 0;
    var minutesInt = 0;

    if (AMPM == "A") {
        hoursInt = parseInt(hoursString);
    }
    else {

        if (parseInt(hoursString) == 12)
            hoursInt = 12
        else
        hoursInt = parseInt(hoursString) + 12;
    }

    minutesInt = parseInt(minuteString);

    current = new Date();


    if (hoursInt > current.getHours())
        return true;
    else if (hoursInt == current.getHours())
        if (minutesInt >= current.getMinutes())
            return true;
        else
            return false;
    else
        return false;

}

module.exports = NodeHelper.create({

    start: function () {
        Log.info("Starting node helper for: " + this.name);
        // this.config = {}
    },

    // get new data to be displayed and send it to main module
    getData: function () {
        var self = this;

        needle.get('https://transport.tamu.edu/BusRoutes/Routes.aspx?r=' + this.config.route, function (error, response) {

            var dict = new Object();
            if (!error && response.statusCode == 200) {

                var busStops = [];

                const $ = cheerio.load(response.body);

                $('table[class="timetable"] th').each((index, element) => {

                    if (index <= 1)
                        return;

                    busStops.push($(element).text());
                });

                var busTimes = new Array(busStops.length).fill(0).map(() => new Array(5).fill(0));

                var i = 0;
                $('table[class="timetable"] tr td').each((index, element) => {
                    i = index % busStops.length;

                    zeroIndex = busTimes[i].indexOf(0);

                    if (zeroIndex == -1)
                        return;
                    else if (checkDateTime($(element).text()))
                        busTimes[i][zeroIndex] = $(element).text()

                });

                dict["busStops"] = busStops;
                dict["busTimes"] = transpose(busTimes)

                busTimes = transpose(busTimes);

                 // ------------------------------------------------------------
                // format busTimes string
                var indices = [0]
                var busString = ""
                var space = "&nbsp;"
                
                for (var i = 0; i < busStops.length; i++) {
                    if (busStops[i].length <= 5) {
                        var tempString = busStops[i] + " ".repeat(5 - busStops[i].length) + "  "
                        busString += tempString
                        indices.push(indices[i] + tempString.length)
                    }
                    else {
                        busString += busStops[i] + "  ";
                        indices.push(indices[i] + busStops[i].length + 2);
                    }

                    if (i == busStops.length - 1)
                        continue            
                }

                busString += "\n";

                for (var i = 0; i < busTimes.length; i++) {
                    var index = 0
                    var tempString = ""
                    for (var j = 0; j < busTimes[i].length; j++) {
                        
                        if (busTimes[i][j] == "0")
                            tempString += " "
                        else
                            tempString += busTimes[i][j];

                        index = tempString.length
                        tempString += " ".repeat(indices[j+1] - index)
                    }
                    busString += tempString + "\n"
                }

                // ------------------------------------------------------------
                

                console.log(busString)

                
                
                self.sendSocketNotification("SCRAPED", busString);

            }
            // else
            //     console.log(response.statusCode)
        });

        
        // const url = 'https://transport.tamu.edu/BusRoutesFeed/api/route/' + self.config.route + '/buses'
        // var data = "<u>Next Bus Stops</u><br>";

        // needle.get(url, function (error, response) {
        //     if (!error && response.statusCode == 200) {
        //         console.log(response.body)
        //         response.body.forEach((obj) => {
		// 	        data = data + obj.nextStop + "<br>"
		//         });
        //         self.sendSocketNotification("API", data);
        //         console.log(data)
        //     }
        //     else
        //         console.log(response.statusCode)
        // });
    },

	socketNotificationReceived: function (notification, payload) {
        // var self = this;
        // Log.info("notif recieved");
        if (notification === 'CONFIG') {
            console.log("CONFIG notification received");
            this.config = payload;
            // this.sendSocketNotification('STARTED');
            this.getData();
            console.log("STARTED notification sent back to front end");
        }
    }
});
