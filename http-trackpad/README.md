HTTP-Trackpad
=============
Use your iPad or another computer on your network to control your Linux desktop.
This program will run on the desktop to be controlled and uses Node.js to deliver
the client through a web browser. Server only tested so far in Ubuntu 11.10.

Dependencies
------------
To run, Node.js and xautomation must be installed.

To install Node and xautomation:

    sudo apt-get install nodejs xautomation

Installation
------------
Download from github:

    git clone http://github.com/trevordixon/http-trackpad

Then to start the program:

    node http-trackpad/app.js

How to Use
----------
On your iPad's or on another computer's browser, go to http://[server IP]:8080.

### iPad
* Tap with one finger to click.
* Tap with two fingers to right click.
* Tap with three fingers to middle click.
* Use two fingers to scroll.

### Desktop Browser
* In most browsers, use F11 to make full-screen.
* Hold control as you move your mouse to prevent the pointer from moving.

Note
----
The client will almost certainly not work in any browser that doesn't support WebSockets.