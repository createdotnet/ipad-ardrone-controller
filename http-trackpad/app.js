// The trackpad's dependencies
var app = require('express').createServer(),
	io = require('socket.io').listen(app),
	exec = require('child_process').exec;

// load in the ardrone
var ardrone = require('ar-drone');
var client = ardrone.createClient();

// Just some useful variables for handling the current status without having to use the arnode data
var status = 'landed';
var statuslocked = false;

// Define the timers that deal with the motion and gesture timing
var scrollTimer = setTimeout();
var tiltTimer = setTimeout();

// Are we currently scrolling?
var scrolling = false;

// Listen on port 8080
app.listen(8080);
console.log('Running on port 8080');

// Get the app html file
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/app.html');
});

io.configure(undefined, function(){
	io.set('log level', 3);
});

// Click and other gesture functions
function xte(c, s) {
	exec("xte -x :0.0 '" + c + " " + s + "'");
}

function click(n) {
	xte('mouseclick', n);
}

// Connect
io.sockets.on('connection', function(socket) {
	socket.on('mousemove', function(d) {
		xte('mousermove', d);
	});

	// Single finger click event
	socket.on('click', function() {
		click(1);
		// Lights
		client.animateLeds('redSnake', 5, 3);
	});

	// Mousedown event
	socket.on('mousedown', function(button) {
		if (button === undefined) button = 1;
		else button = button + 1;
		xte('mousedown', button);
	});

	// Mouseup event
	socket.on('mouseup', function(button) {
		if (button === undefined) button = 1;
		else button = button + 1;
		xte('mouseup', button);
	});

	// Right click event
	socket.on('rightclick', function() {
		click(3);
	});

	// Middle (three finger click)
	socket.on('middleclick', function() {
		
		// Because we are not using the drone's state, this variable stops us from accidentally double tapping and taking off / landing too quickly
		if ( statuslocked == false ) {

			// Lock the status
			statuslocked = true;

			// If it's on the ground, we want to take off
			if ( status == 'landed' ) {

				// Update the status
				status = 'flying';

				// Take off!
				client.takeoff();
				client.stop();

				// Try and steady the drone just in case.
				client.after(1000, function() { this.stop(); });

			} else if (status == 'flying') {
				// Land the drone
				client.land();

				// Update the status in 5 seconds
				setTimeout(function(){ status = 'landed'; },5000);
			}
			
		}

		// unlock the land / take off status in a second
		setTimeout( function (){ statuslocked = false; }, 1000 );

		// Run the middle click
		click(2);
	});

	// Scroll up event
	socket.on('scrollup', function() {

		// Stop the current scrolling timer
		clearTimeout(scrollTimer);

		// Go up ^
		scrolling = "up";
		client.up(0.8);

		// In 400 milliseconds set the scrolling status to just hover, and stop the up and down movements
		scrollTimer = setTimeout(function() { scrolling = "hover"; client.stop(); }, 400);

		click(4);
		
	});

	// Scroll down event 
	socket.on('scrolldown', function() {
		
		// Stop the current scrolling timer
		clearTimeout(scrollTimer);

		// Go down v 
		scrolling = "down";
		client.down(0.8);

		// In 400 milliseconds set the scrolling status to just hover, and stop the up and down movements
		scrollTimer = setTimeout(function() { scrolling = "hover"; client.stop(); }, 400);
		
	click(5);

	});

	// Mouse move
	socket.on('mousemove', function(e) {
		
		// Clear the tiltTimer
		clearTimeout(tiltTimer);

		// Grab the x and y position of your finger
		var position = e.split(' ');

		// Specify the x and y positions
		var x = position[0];
		var y = position[1];

		// TODO: Make 0.8 calculated based on acceleration of finger movement
		// If you've moved more than 10 pixels to the right then move right
		if ( x > 10 ) {
			client.right ( 0.8 );
		}
		// If you've moved more than 10 pixels to the left then move left
		else if ( x < -10 ) {
			client.left ( 0.8 );
		}

		// If you've moved more than 10 pixels down then move backwards
		if ( y > 10 ) {
			client.back( 0.8 );
		}
		// If you've moved more than 10 pixels up then move forwards
		else if ( y < -10 ) {
			client.front( 0.8 );
		}

		// In a 1.5 seconds cancel the tilting.. not sure this is perfect
		tiltTimer = setTimeout(function() { tilting = "false"; client.stop(); }, 1500);

	});

});
