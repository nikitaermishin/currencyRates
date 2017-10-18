"use strict";

let drawer = new mdc.drawer.MDCTemporaryDrawer(document.querySelector('.mdc-temporary-drawer'));
document.querySelectorAll('.menu').forEach(item => item.addEventListener('click', () => drawer.open = true));
const select1 = new mdc.select.MDCSelect(document.querySelectorAll('.mdc-select')[0]);
const select2 = new mdc.select.MDCSelect(document.querySelectorAll('.mdc-select')[1]);
const textfield1 = new mdc.textfield.MDCTextfield(document.querySelectorAll('.mdc-textfield')[0]);
const textfield2 = new mdc.textfield.MDCTextfield(document.querySelectorAll('.mdc-textfield')[1]);
const swap = document.querySelector('#changer');
const list = document.querySelectorAll('.page__main, .page__settings, .page__about');
const innerDrawerChld = Array.prototype.slice.call(document.querySelector('.mdc-temporary-drawer__content').children);
const snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('.mdc-snackbar'));
const pageLoading = document.querySelector('.page__loading');
const pageMain = document.querySelector('.page__main');
document.querySelectorAll('.mdc-temporary-drawer__content > .mdc-list-item').forEach(item => item.addEventListener('click', openWindow));

let val;

let snackbarOpt = {
	actionText: 'OK',
	actionHandler: function () {},
	timeout: 100000000000000000
}

select1.listen('MDCSelect:change', () => {
    calc();
});
select2.listen('MDCSelect:change', () => {
    calc();
});

const spinner = document.querySelector('.spinner'),
	main = document.querySelector('.page__main');

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

swap.onclick = swapHandler;

document.addEventListener('deviceready', work, false);

async function getValutesOnline() {
	try {
		data = await getAndParseJSON('http://api.fixer.io/latest');
		configObj(data);
        // writeFile();
	} catch (e) {
		showNetErr(e);
	}
}

function configObj(obj) { // Adding Base and writing to <data>
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
	pageLoading.classList.add('off');
	setInterval(checker, 10);
}

function enableMain() {
	pageMain.style.display = 'block';
}

function calc() {
	const [coef, val, res] = countValCoefRes(textfield1);
	if (res === '') {
		removeVal();
		return;
	}
	writeVal(val / coef);
}

function countValCoefRes(field) {
	const from = select1.selectedText_.textContent,
		to = select2.selectedText_.textContent,
		fromObj = data.rates[from],
		toObj = data.rates[to],
		coef = fromObj / toObj,
		res = field.input_.value,
		val = parseFloat(res);
	return [coef, val, res];
}

function writeVal(val) {
	val = (!val) ? 0 : val;
	textfield2.label_.classList.add('mdc-textfield__label--float-above');
	textfield2.input_.value = val;
}

function removeVal() {
	textfield2.label_.classList.remove('mdc-textfield__label--float-above');
	textfield2.input_.value = '';
}

function showCacheErr(err) {
  console.error(err);
}

function writeRequestFS(fs) {
    fs.root.getFile('cache.json', {create: true}, writeFileEntry, errorCallback);
}

function writeFileEntry(fileEntry) {
    fileEntry.createWriter(writeFileWriter, errorCallback);
}

function writeFileWriter(fileWriter) {
    fileWriter.onwriteend = onwriteend;

    fileWriter.onerror = onwriteerror

    let blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    fileWriter.write(blob);
}

function onwriteend(e) {
    console.log('Write completed.');
}

function onwriteerror(e) {
    throw new Error('Write failed: ' + e.toString());
}

function writeFile() {
  let type = window.TEMPORARY;
  let size = 5*1024*1024;
  window.requestFileSystem(type, size, writeRequestFS, errorCallback)

  function errorCallback(error) {
    throw new Error("Write error: " + error.code)
  }
}

function readFile() {
  let type = window.TEMPORARY;
  let size = 5*1024*1024;
  window.requestFileSystem(type, size, successCallback, errorCallback);

  function errorCallback(error) {
    throw new Error("Read error: " + error.code)
  }
}

function readRequestFS(fs) {
    fs.root.getFile('cache.json', {}, readFileEntry, errorCallback);
}

function readFileEntry(fileEntry) {
    fileEntry.file(function(file) {
        let reader = new FileReader();

        reader.onloadend = function(e) {
		  data = JSON.parse(this.result);
		  snackbarOpt.message = `Using rates from ${data.date}`;
		  snackbar.show(snackbarOpt);
        };
        reader.readAsText(file);
      }, errorCallback);
}

function swapHandler() {
	let option1 = select1.selectedText_.textContent,
		option2 = select2.selectedText_.textContent;
		select1.selectedText_.textContent = option2;
		select2.selectedText_.textContent = option1;
	calc();
}

function checker() {
	let newVal = textfield1.input_.value;
	if (newVal != val && data.rates) {
		calc();
	}
	val = newVal;
}

function openWindow() {
	let className = this.dataset.window;
	list.forEach(item => item.style.display = 'none');
	document.querySelector(className).style.display = 'block';
	innerDrawerChld.forEach(item => item.classList.remove('mdc-temporary-drawer--selected'));
	this.classList.add('mdc-temporary-drawer--selected');
	drawer.open = false;
}

work();