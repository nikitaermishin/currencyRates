"use strict";

const input1 = document.querySelector('#input1'),
	input2 = document.querySelector('#input2'),
	input1Placeholder = document.querySelector('#input1-name'),
	input2Placeholder = document.querySelector('#input2-name'),
	selectFrom = document.querySelector('.select-from'),
	selectTo = document.querySelector('.select-to'),
	content = document.querySelector('.content'),
	spinner = document.querySelector('.spinner'),
	main = document.querySelector('.main'),
	submit = document.querySelector('.submit');

let data = {};

new Choices('.select-from', {searchEnabled: false});
new Choices('.select-to', {searchEnabled: false});
changePlaceholder1();
selectFrom.onchange = changePlaceholder1;
changePlaceholder2();
selectTo.onchange = changePlaceholder2;

submit.onclick = clickHandler;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	work();
}

async function getValutesOnline() {
	try {
		let response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
		let obj = await response.json();
		obj['Valute'].RUB = {
			Value: 1,
			Nominal: 1
		};
		console.log(obj);
		data = obj;
		if (!data) {
			throw new Error("Can`t get data");
		}
    writeFile();
	} catch (e) {
		showNetErr(e);
	}
}

function getValutesOffline() {
	readFile();
}

function checkConnection() {
	return window.navigator.onLine;
}

function showNetErr(err) {
	console.error(err);
	swal({
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
	}).then(function () {
		work();
	}, function (dismiss) {
	  // dismiss can be 'cancel', 'overlay',
	  // 'close', and 'timer'
	  if (dismiss === 'cancel') {
	  	navigator.app.exitApp();
	  } else if (dismiss === 'close') {
	  	work();
	  }
	});
}

function work() {
	spinner.classList.remove('off');
	try {
		if (checkConnection()) {
			getValutesOnline();
		} else {
			getValutesOffline();
		}
    main.classList.add('active');
    content.classList.add('active');
	} catch (e) {
		showNetErr(e);
	}
	spinner.classList.add('off');
}

function clickHandler() {
	const from = selectFrom.value,
    to = selectTo.value,
    fromObj = data['Valute'][from],
    toObj = data['Valute'][to],
    coef = fromObj.Value / toObj.Value / fromObj['Nominal'] / toObj['Nominal'],
	  val1 = parseFloat(input1.value);
	if (!isNaN(val1)) {
		input2.parentElement.classList.add('is-dirty');
		input2.value = val1 * coef;
	}
}

function changePlaceholder1() {
	input1Placeholder.innerHTML = selectFrom.value;
}

function changePlaceholder2() {
	input2Placeholder.innerHTML = selectTo.value;
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