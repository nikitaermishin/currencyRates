"use strict";
// setup variables
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

// event listener

document.addEventListener('deviceready', onDeviceReady, false);

// functions

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
	try {
		let promise = await requestFunc();
		let obj = JSON.parse(promise);
		data = obj.Valute;
		data.RUB = {
			Value: 1
		}
		console.log(data);
		main.classList.add('active');
		content.classList.add('active');
	} catch (e) {
		showNetErr(e);
	}
	spinner.classList.add('off'); //.display = 'none';
	// main.classList.add('active'); //.justifyContent = 'flex-start';
	// content.classList.add('active'); //.display = 'block';
}

function onDeviceReady() {
	checkConnection() ? getValutes() : showNetErr('Internet connection problem');
}

function checkConnection() {
	var networkState = navigator.network.connection.type;
	return networkState !== Connection.NONE;
}

function showNetErr(err) {
	console.error(err);
	error.classList.add('active');
}