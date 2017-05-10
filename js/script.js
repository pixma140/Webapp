// current filter vars
var lastFilter;
var currentFilter;
var currentFilterPos;

//TODO: add more filters
//array containing the filters
var filters = new Array("none","hue-rotate(90deg)","hue-rotate(180deg)","hue-rotate(270deg)","invert(100%)",
						"contrast(50%)","brightness(50%)","grayscale(50%)","opacity(50%)","sepia(50%)",
						"blur(3px)","blur(5px)","saturation(50%)","saturation(200%)","brightness(200%)",
						"contrast(200%)","grayscale(100%)","sepia(100%)","contrast(200%) brightness(150%)");

var inTakePicture = false;

// initialize method
function initialize() {	
	
	// check if cookie favorite filter is set
	if(getCookie("lastFilter") == ""){
		// set last filter to no filter
		
		createCookie('lastFilter','0', 20);
		//document.cookie="lastFilter=0";
		
		lastFilter = 0;		
		
	} else {
		// get last filter
		lastFilter = getCookie("lastFilter");			
	}
	
	// set current filter
	currentFilterPos = lastFilter;
	currentFilter = filters[lastFilter];		
	
	// make unused buttons invisible
	document.getElementById('buttonBack').style.display = "none";
	document.getElementById('buttonSave').style.display = "none";
	document.getElementById('buttonBackward').style.display = "none";
	document.getElementById('buttonForward').style.display = "none";
	
	// debug texts
	// alert((currentFilterPos) + "/" + (filters.length - 1) + " " + currentFilter);
	document.getElementById('filterDebugLabel').innerHTML = (currentFilterPos) + "/" + (filters.length - 1) + " " + currentFilter;
	
	// add event listener to button save send
	document.getElementById('myDownloadLink').addEventListener('click', buttonSavePressed, false);
	
	// get video and add shake listener
	start(0);
	shakeIt();
	
	document.getElementById('snackbar').innerHTML = "set filter: " + currentFilter;
	mySnackbarFunction();
}

// function that handles back button
function buttonBackPressed() {
	inTakePicture = false;
	
	document.getElementById('buttonNewPicture').style.display = "block";
	document.getElementById('buttonSwitchCamera').style.display = "block";
	document.getElementById('buttonBack').style.display = "none";
	document.getElementById('buttonSave').style.display = "none";
	document.getElementById('buttonBackward').style.display = "none";
	document.getElementById('buttonForward').style.display = "none";
	
	// add video
	var toAddVideo = document.createElement('video');
	toAddVideo.id = "myVideo";
	toAddVideo.autoplay = "true";
	document.getElementById("myVideoDiv").appendChild(toAddVideo);
	
	// remove canvas
	var canvasDiv = document.getElementById('myCanvasDiv');
	canvasDiv.removeChild(document.getElementById('myCanvas'));
	
	// restartVideo
	initialize();
	
	// reset unedited canvas
	uneditedCanvas = null;
}

// function that switches filters
function switchFilter() {		
	//update last used filter to cookie
	createCookie('lastFilter',currentFilterPos, 20);	
	
	// make vibration work everywhere
	window.navigator.vibrate = window.navigator.vibrate || window.navigator.webkitVibrate || window.navigator.mozVibrate || window.navigator.msVibrate;
	
	if ("vibrate" in window.navigator) {		
		window.navigator.vibrate(50);		
	} else {
		alert("Vibration not supported");
	}
	
	// filter gets applied here
	applyFilter();
	
	//TODO: remove filter debug label
	//alert((currentFilterPos) + "/" + (filters.length - 1) + " " + currentFilter);
	document.getElementById('filterDebugLabel').innerHTML = (currentFilterPos) + "/" + (filters.length - 1) + " " + currentFilter;
	
	document.getElementById('snackbar').innerHTML = "current filter: " + currentFilter;
	mySnackbarFunction();
}

// WORKZONE ============================================================================================
// WORKZONE ============================================================================================
// WORKZONE ============================================================================================

// method that decides which filter to use
var uneditedCanvas = null;
var myUneditedDataArray = null;
function applyFilter() {
	//var c = document.getElementById('myCanvas');
	var c = uneditedCanvas;
	var ctx = c.getContext('2d');
	//ctx.drawImage(c, 0, 0);	
	var data = ctx.getImageData(0,0,c.width,c.height);
	data.data = myUneditedDataArray;	
	
	// choose right filter
	if (currentFilter == "none") {
		data = uneditedCanvas.getContext('2d').getImageData(0,0, uneditedCanvas.width, uneditedCanvas.height);
	} else if (currentFilter == "grayscale(50%)") {
		data.data = grayscale(data.data);
	} else if (currentFilter == "brightness(50%)") {
		data.data = brightness(data.data, 0.5);
	} else if (currentFilter == "brightness(200%)") {
		data.data = brightness(data.data, 2);
	} else if (currentFilter == "invert(100%)") {
		data.data = invert(data.data);
	} else if (currentFilter == "contrast(50%)") {
		data.data = contrast(data.data, 0.5);
	} else if (currentFilter == "contrast(200%)") {
		data.data = contrast(data.data, 2);
	} else if (currentFilter == "saturation(50%)") {
		data.data = saturation(data.data, 0.5);
	} else if (currentFilter == "saturation(200%)") {
		data.data = saturation(data.data, 2);
	}
		
	ctx.putImageData(data, 0, 0);
}

// grayscale filter
function grayscale(d) {		
	for (var i = 0; i < d.length; i += 4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		d[i] = d[i+1] = d[i+2] = v;
	}
	return d;
}

// grayscale filter
function brightness(d, myPercentage) {
	for (var i = 0; i < d.length; i += 4) {
		d[i] = d[i] * myPercentage;
		d[i+1] = d[i+1] * myPercentage;
		d[i+2] = d[i+2] * myPercentage;
	}
	return d;
}

// contrast filter
function contrast(d, myPercentage) {		
	for (var i = 0; i < d.length; i += 4) {
		d[i] = ((((d[i] / 255) - 0.5) * myPercentage) + 0.5) * 255;
		d[i+1] = ((((d[i+1] / 255) - 0.5) * myPercentage) + 0.5) * 255;
		d[i+2] = ((((d[i+2] / 255) - 0.5) * myPercentage) + 0.5) * 255;		
	}
	return d;
}

// invert filter
function invert(d) {
	for (var i = 0; i < d.length; i += 4) {		
		d[i] = 255 - d[i];
		d[i+1] = 255- d[i+1];
		d[i+2] = 255 - d[i+2];					
	}  
	return d;
}

// saturation function
function saturation(d, myPercentage) {
	for (var i = 0; i < d.length; i += 4) {	
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		var hsv = rgbToHsv(r, g, b);
		
		hsv[1] = hsv[1] * myPercentage;
		
		var rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
		
		d[i] = rgb[0];
		d[i+1] = rgb[1];
		d[i+2] = rgb[2];
	}  
	return d;
}


// WORKZONE ============================================================================================
// WORKZONE ============================================================================================
// WORKZONE ============================================================================================

// function to handle camera switch
function buttonSwitchKameraPressed() {			
	//alert("buttonSwitchKameraPressed");		
	
	currentSource++;
	
	if (currentSource == videoSources.length) {
		currentSource = 0;	
	}
	
	start(currentSource);
	
	document.getElementById('snackbar').innerHTML = "switched camera";
	mySnackbarFunction();
}

// function to take snapshot from video
function buttonNewPicturePressed() {
	//alert("buttonNewPicturePressed");
	inTakePicture = true;
	
	//button handling
	document.getElementById('buttonNewPicture').style.display = "none";
	document.getElementById('buttonSwitchCamera').style.display = "none";
	document.getElementById('buttonBack').style.display = "block";
	document.getElementById('buttonSave').style.display = "block";
	document.getElementById('buttonBackward').style.display = "block";
	document.getElementById('buttonForward').style.display = "block";	
	
	// create canvas
	var toAddCanvas = document.createElement('canvas');
	toAddCanvas.id = "myCanvas";
	document.getElementById("myCanvasDiv").appendChild(toAddCanvas); 			
	
	// get stuff
	var myVideo = document.querySelector('video');
	var canvas = document.querySelector('canvas');	
        
	// set canvas stuff
	canvas.width = myVideo.clientWidth;
	canvas.height = myVideo.clientHeight;
	
	// get context
	var ctx = canvas.getContext("2d");	
	ctx.drawImage(myVideo, 0, 0, canvas.width, canvas.height);
	
	// set unedited canvas for filtering
	//uneditedCanvas = cloneCanvas(document.getElementById('myCanvas'));
	uneditedCanvas = document.getElementById('myCanvas');
	var rawImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	myUneditedDataArray = rawImageData.data;
	
	// apply current filter
	applyFilter();
	document.getElementById('snackbar').innerHTML = "current filter: " + currentFilter;
	mySnackbarFunction();
	
	// remove video
	var videoDiv = document.getElementById('myVideoDiv');
	videoDiv.removeChild(document.getElementById('myVideo'));
}

// function to handdle save pressed
function buttonSavePressed() {
	//alert("buttonSavePressed");	
	
	//button handling
	document.getElementById('buttonNewPicture').style.display = "block";
	document.getElementById('buttonSwitchCamera').style.display = "block";
	document.getElementById('buttonBack').style.display = "none";
	document.getElementById('buttonSave').style.display = "none";
	
	// variable declaration
	var canvas = document.getElementById("myCanvas");
	var myDownloadLink = document.getElementById("myDownloadLink");
	var filename = getDate() + "-" + currentFilter;
		
	// takes screenshot from canvas and writes into canvas
	/* html2canvas(document.querySelector("#myCanvas"), {canvas: canvas}).then(function(canvas) {            		
		//console.log('Drew on the existing canvas the following filter' + currentFilter);
	}); */
	
	// download process	
	var dt = canvas.toDataURL("image/jpeg");
	//var dt = canvas.toDataURL("image/png"); alternative
	
	myDownloadLink.download = filename;
    this.href = dt; //this may not work in the future...
	
	// add video
	var toAddVideo = document.createElement('video');
	toAddVideo.id = "myVideo";
	toAddVideo.autoplay = "true";
	document.getElementById("myVideoDiv").appendChild(toAddVideo);
	
	// remove canvas
	var canvasDiv = document.getElementById('myCanvasDiv');
	canvasDiv.removeChild(document.getElementById('myCanvas'));
	
	// restartVideo
	initialize();
	
	// set mode to not in take picture and reset unedited canvas
	inTakePicture = false;
	uneditedCanvas = null;
	
	document.getElementById('snackbar').innerHTML = "saved image";
	mySnackbarFunction();
}

// variables for video
var videoSources = new Array();
var videoSoureCounter = 0;
var currentSource = 0;

// enumerating devices and writing into device list
function gotDevices(deviceInfos) {
	videoSources = [];
	videoSoureCounter = 0;
	
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		
		if (deviceInfo.kind === 'videoinput') {  
			videoSources.push(deviceInfo.deviceId);
			videoSoureCounter++;
		}
	}
}

// error handing
function handleError(error) {
	document.getElementById('snackbar').innerHTML = "an error occured while reading devices";
	mySnackbarFunction();
}

// initial enumerate devices
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

// function i have a stream
function gotStream(stream) {
  window.stream = stream; // make stream available to console
  document.querySelector('video').srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

//function to start the stream
function start(nbr) {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  
  //alert("try to set camera:" + nbr);
  
  //select video source
  var videoSource = videoSources[nbr];  
  
  var constraints = {
    audio: false,
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

// device motion handling for filter change
var lastAction = new Date();
function shakeIt() {
	window.ondevicemotion = function(coords) {
		var sensibility = 5;
		var minTime = 500;
		var accX = coords.acceleration.x;
		var time = new Date();
		if ((time - lastAction) < minTime) return;
		if (accX >= sensibility || accX <= -sensibility) {
			//alert("button switch");
			if (inTakePicture) {
				accX > 0 ? buttonForwardPressed() : buttonBackwardPressed();
			}
			
			lastAction = time;
		}
	}
}

// function to get date
function getDate() {
	var date = new Date();

	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var hour = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var today = year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec;
	
	return today;
}

// function to create cookie
function createCookie(name,value,days) {
     if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
     }
     else var expires = "";
     document.cookie = name+"="+value+expires+";";
}

// function to get cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {			
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// function that handles backward button
function buttonBackwardPressed() {
	//alert("buttonBackwardPressed");
	
	currentFilterPos--;		
	
	if (currentFilterPos == -1) {
		currentFilterPos = filters.length-1;
		currentFilter = filters[currentFilterPos];
	} else {
		currentFilter = filters[currentFilterPos];
	}
	
	switchFilter();
}

// function that handles forward button
function buttonForwardPressed() {
	//alert("buttonBackwardPressed");
	
	currentFilterPos++;
	
	if (currentFilterPos == filters.length) {
		currentFilterPos = 0;
		currentFilter = filters[currentFilterPos];
	} else {
		currentFilter = filters[currentFilterPos];
	}	
	
	switchFilter();
}

// snackbar function
function mySnackbarFunction() {
    // Get the snackbar DIV
    var x = document.getElementById("snackbar")

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);
}

// function to copy canvas
function cloneCanvas(oldCanvas) {

    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}

// function that calculates hsv to rgb values
function hsvToRgb(h, s, v) {
	var i;
	var r,g,b;
	
	if(s === 0) {
		// achromatic (grey)
		r = g = b = v;
		return [r,g,b];
	}
	
	h /= 60;            // sector 0 to 5
	i = Math.floor(h);
	
	f = h - i;          // factorial part of h
	
	p = v * ( 1 - s );
	q = v * ( 1 - s * f );
	t = v * ( 1 - s * ( 1 - f ) );
	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		default:        // case 5:
			r = v;
			g = p;
			b = q;
			break;
	}
	return [r,g,b];
}

// function that calculates rgb to hsv values
function rgbToHsv(r, g, b) {
	
	var h,s,v;
	
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);

	v = max;
	
	var delta = max - min;
	
	if(max != 0) {
		s = delta / max;        // s
	} else {
		// r = g = b = 0        // s = 0, v is undefined
		s = 0;
		h = -1;
		return [h, s, undefined];
	}
	
	if(r === max) {
		h = (g - b) / delta;      // between yellow & magenta
	} else if(g === max) {
		h = 2 + (b - r)  / delta;  // between cyan & yellow
	} else {
		h = 4 + (r - g) / delta;  // between magenta & cyan
	}
	
	h *= 60;
	
	// degrees
	if(h < 0) {
		h += 360;
	}
	
	if (isNaN(h)) {
		h = 0;
	}
	
	return [h,s,v];
}