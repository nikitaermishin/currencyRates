"use strict";

//document.addEventListener("deviceready", onDeviceReady, false);

var input1 = document.querySelector('.input-val1'),
	input2 = document.querySelector('.input-val2'),
	selectFrom = document.querySelector('.select-from'),
	selectTo = document.querySelector('.select-to'),
	content = document.querySelector('.content'),
	spinner = document.querySelector('.spinner'),
	main = document.querySelector('.main'),
	error = document.querySelector('.error'),
	submit = document.querySelector('.submit');

submit.onclick = clickHandler;

function onDeviceReady() {
	work();
}

function requestFunc() {
	return new Promise(function(resolve, reject) {
		var url = "https://www.cbr-xml-daily.ru/daily_json.js";

		var req = new XMLHttpRequest();
		req.open('GET', url);

		req.onload = function() {
			if (req.status === 200) {
				resolve(req.response);
			} else {
				reject(Error('Error, status: ' + req.statusText));
			}
		}

		req.onerror = function() {
			reject('Error, problem with Network');
		}

		req.send();
	})
};

async function getValutes() {
	try {
		var obj;
		let promise = await requestFunc();
		obj = JSON.parse(promise);
		obj.Valute.RUB = {
			Value: 1
		}
		console.log(obj);
		window.data = obj;
		main.classList.add('active');
		content.classList.add('active');
	} catch (e) {
		showNetErr(e);
	}
}

function checkConnection() {
	if (!window.navigator.onLine) throw new Error('No internet connection');
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
	    '<span>Exit<span>'
	}).then(function () {
		work();
	}, function (dismiss) {
	  // dismiss can be 'cancel', 'overlay',
	  // 'close', and 'timer'
	  if (dismiss === 'cancel') {
	  	navigator.app.exitApp();
	  }
	});
}

function work() {
	spinner.classList.remove('off');
	try {
		checkConnection();
		getValutes();
		// window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
	} catch (e) {
		showNetErr(e);
	}
	spinner.classList.add('off');
}

function gotFS(fileSystem) {
	fileSystem.root.getFile("cache.json", {create: true, exclusive: false}, gotFileEntry, fail);
}

function gotFileEntry(fileEntry) {
	fileEntry.createWriter(gotFileWriter, fail);
}

function gotFileWriter(writer) {
	writer.onwriteend = function(evt) {
		console.log('Data cashed');
	};
	writer.write(JSON.stringify(data));
}

function fail(err) {
	throw new Error(err);
}

function clickHandler() {
	var from = selectFrom.value;
	var to = selectTo.value;
	var coef = data.Valute[from].Value / data.Valute[to].Value;
	var val1 = parseFloat(input1.value);
	var val2 = parseFloat(input2.value);
	if (val1) {
		input2.parentElement.classList.add('is-dirty');
		input2.value = val1 * coef;
	}
}

onDeviceReady();