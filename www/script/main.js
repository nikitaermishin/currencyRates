"use strict";

const input1 = document.querySelector('#input1'),
	input2 = document.querySelector('#input2'),
	selectFrom = document.querySelector('#select1'),
	selectTo = document.querySelector('#select2'),
	content = document.querySelector('.content'),
	spinner = document.querySelector('.spinner'),
	main = document.querySelector('.main'),
	submit = document.querySelector('.submit');

let data = {};
let	swalOptions = {
	title: 'Oops...',
	html: 'Problem with your internet connection!<br>Sorry, our app need internet.',
	type: 'error',
	showCloseButton: true,
	showCancelButton: true,
	allowOutsideClick: false,
	confirmButtonText:
		'Retry',
	cancelButtonText:
		'Exit'
};
let swalCallback = function (dismiss) {
	if (dismiss === 'cancel') {
		navigator.app.exitApp();
	} else if (dismiss === 'close') {
		work();
	}
};

submit.onclick = clickHandler;

document.addEventListener('deviceready', work, false);

async function getValutesOnline() {
	try {
		data = await getAndParseJSON('http://api.fixer.io/latest');
		configObj(data);
    writeFile();
	} catch (e) {
		showNetErr(e);
	}
}

function configObj(obj) { // Adding Rubles and writing to <data>
	obj.rates[obj.base] = 1;
	console.log(obj);
	if (!obj) {
		throw new Error("Can`t get data");
	}
}

async function getAndParseJSON(url) { // Geting and parsing Json
	let response = await fetch(url);
	let obj = await response.json();
	return obj;
}

function getValutesOffline() {
	readFile();
}

function checkConnection() {
	return window.navigator.onLine;
}

function showNetErr(err) {
	console.error(err);
	swal(swalOptions).then(function () {
		work();
	}, swalCallback);
}

function work() {
	try {
		checkConnection() ? getValutesOnline() : getValutesOffline();
    enableMain();
	} catch (e) {
		showNetErr(e);
	}
	spinner.classList.add('off');
}

function enableMain() {
	main.classList.add('active');
	content.classList.add('active');
}

function clickHandler() {
	const from = selectFrom.value,
    to = selectTo.value,
    fromObj = data.rates[from],
    toObj = data.rates[to],
    coef = fromObj / toObj,
	  val1 = parseFloat(input1.value);
	if (!isNaN(val1) && coef) {
		input2.parentElement.classList.add('is-dirty');
		input2.value = (val1 * coef) || 0;
	}
}

function showCacheErr(err) {
  console.error(err);
}

function writeFile() {
  let type = window.TEMPORARY;
  let size = 5*1024*1024;
  window.requestFileSystem(type, size, successCallback, errorCallback)

  function successCallback(fs) {
    fs.root.getFile('cache.json', {create: true}, function(fileEntry) {

      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
          throw new Error('Write completed.');
        };

        fileWriter.onerror = function(e) {
          throw new Error('Write failed: ' + e.toString());
        };

        let blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        fileWriter.write(blob);
      }, errorCallback);
    }, errorCallback);
  }

  function errorCallback(error) {
    throw new Error("Write error: " + error.code)
  }
}

function readFile() {
  let type = window.TEMPORARY;
  let size = 5*1024*1024;
  window.requestFileSystem(type, size, successCallback, errorCallback);

  function successCallback(fs) {
    fs.root.getFile('cache.json', {}, function(fileEntry) {

      fileEntry.file(function(file) {
        let reader = new FileReader();

        reader.onloadend = function(e) {
          data = JSON.parse(this.result);
        };
        reader.readAsText(file);
      }, errorCallback);
    }, errorCallback);
  }

  function errorCallback(error) {
    throw new Error("Read error: " + error.code)
  }
}