"use strict";
var val1 = document.querySelector('.input-val1'),
	val2 = document.querySelector('.input-val2'),
	selectFrom = document.querySelector('.select-from'),
	selectTo = document.querySelector('.select-to'),
	content = document.querySelector('.content'),
	spinner = document.querySelector('.spinner'),
	main = document.querySelector('.main'),
	error = document.querySelector('.error'),
	data = {},
	connect = false;

work();


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
			reject(Error('Error, problem with Network:'));
		}

		req.send();
	})
};

async function getValutes() {
	let promise = await requestFunc();
	let obj = JSON.parse(promise);
	data = obj.Valute;
	data.RUB = {
		Value: 1
	}
	console.log(data);
	main.classList.add('active');
	content.classList.add('active');
}

function onDeviceReady() {
	checkConnection() ? getValutes() : showNetErr('Internet connection problem');
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
	} catch (e) {
		showNetErr(e);
	}
	spinner.classList.add('off');
}