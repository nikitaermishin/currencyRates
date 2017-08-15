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

function requestFunc() {
	return new Promise(function(resolve, reject) {
		let url = 'https://www.cbr-xml-daily.ru/daily_json.js';

		let req = new XMLHttpRequest();
		req.open('GET', url);

		req.onload = function() {
			if (req.status === 200) {
				resolve(req.response);
			} else {
				reject(Error('Error, status: ' + req.statusText));
			}
		};

		req.onerror = function() {
			reject('Error, problem with Network');
		};

		req.send();
	});
}

async function getValutesOnline() {
	try {
		let obj;
		let result = await requestFunc();
		obj = JSON.parse(result);
		obj['Valute'].RUB = {
			Value: 1
		};
		console.log(obj);
		data = obj;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, showCacheErr);
	} catch (e) {
		showNetErr(e);
	}
}

function getValutesOffline() {
	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + '/cache.json', gotFile, showCacheErr);
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

function gotFS(fileSystem) {
	fileSystem.root.getFile(cordova.file.applicationDirectory + '/cache.json', {create: true, exclusive: false}, gotFileEntry, showCacheErr);
}

function gotFileEntry(fileEntry) {
	fileEntry.createWriter(gotFileWriter, showCacheErr);
}

function gotFileWriter(writer) {
	writer.onwriteend = function() {
		console.log('Data cashed');
	};
	writer.write(JSON.stringify(data));  //why?
}

function gotFile(fileEntry) {
    fileEntry.file(function(file) {
        let reader = new FileReader();

        reader.onloadend = function() {
            console.log('Cashed data is: ' + this.result);
            data = this.result;
        };

        reader.readAsText(file);
    });
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