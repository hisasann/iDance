/**
 * AudioDance
 * webkitAudioContextを使って、音とCanvas描画をシンクロさせます。
 * Author: hisasann
 * SpecialThanks: ken_c_lo
 * 
 * 参考URL：
 * http://jsdo.it/mackee/9WGv
 * http://www.usamimi.info/~ide/programe/tinysynth/doc/audioapi-report.pdf
 * http://epx.com.br/artigos/audioapi.php
 * http://paperjs.org/
 */

(function() {

var AudioDance = {};

var 
	context,
	source,
	gainNode,
	analyserNode,
	timeDomainData,
	
	canvas,
	options = [],
	circles = [],
	path,
	
	SHOW_CIRCLES_COUNT = 20,
	SOUND_FILE = "Eris.ogg";

AudioDance.play = function() {
	if (!window.webkitAudioContext) {
		throw "UnSupported AudioContext";
	}
	
	createAudioContext();
}

function createAudioContext() {
	context = new webkitAudioContext();
	source = context.createBufferSource();
	gainNode = context.createGainNode();
	analyserNode = context.createAnalyser();

	gainNode.gain.value = 0.5;

	source.connect(gainNode);
	gainNode.connect(analyserNode);
	analyserNode.connect(context.destination);

	createXHR("sound/" + SOUND_FILE, function(xhr) {
		init(xhr);
	});
	
	timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);
}

function createXHR(url, fn) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.responseType = "arraybuffer";

	xhr.onload = function() {
	    fn(xhr);
	};

	xhr.send();
}

function init(xhr) {
    source.buffer = context.createBuffer(xhr.response, false);
    source.noteOn(context.currentTime);

	canvas = document.getElementById("canvas");
	paper.setup(canvas);
	paper.view.onFrame = onFrame;
}

function onFrame() {
	analyserNode.getByteFrequencyData(timeDomainData);

	drawImage(timeDomainData);
}

var speaker1, speaker2;
function drawImage(data) {
	if (speaker1) {
		speaker1.remove();
	}
	
	var size = 300,
		left = Math.floor(($(window).width()) / 2),
		top = Math.floor(($(window).height()) / 2);

	speaker1 = new paper.Raster("jobs");
	speaker1.size = new paper.Size(size, size);
	speaker1.position = new paper.Point(left - size, top);
	speaker1.scale(data[50 * (5 + 1)] / 100);

	if (speaker2) {
		speaker2.remove();
	}
	speaker2 = new paper.Raster("apple");
	speaker2.size = new paper.Size(size, size);
	speaker2.position = new paper.Point(left + size, top);
	speaker2.scale(data[50 * (8 + 1)] / 100);
}

window.AudioDance = AudioDance;

})();
