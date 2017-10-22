"use strict";

async function preload() {
	let data = await request();
	render(data);
	main(data);
}

// REQUEST

async function request() {
	let value;
	try {
		value = checkConnection() ? await getValutesOnline() : getCache();
	} catch(e) {
		showNetErr(e);
	}
	return value;
}

async function getValutesOnline() {
	try {
		let data = await getAndParseJSON('http://api.fixer.io/latest');
		configObj(data);
		writeFile(data);
		return data;
	} catch (e) {
		showNetErr(e);
	}
}

async function getAndParseJSON(url) {
	let response = await fetch(url);
	let obj = await response.json();
	return obj;
}

function showNetErr(err) {
	console.error(err);
	swal(swalOptions).then(function () {
		preload();
	}, swalCallback);
}

function configObj(obj) { // Adding Base
	obj.rates[obj.base] = 1;
	console.log(obj);
	if (!obj) {
		throw new Error("Can`t get data");
	}
}

function checkConnection() {
	return window.navigator.onLine;
}

function getCache() {
	return readFile() || showCacheErr();
}

// RENDER

function render(data) {
	class List extends React.Component {
		render() {
			let data = this.props.data,
				inner = [];
			for (let key in data.rates) {
				inner.push(<li className="mdc-list-item" role="option" tabindex="0">{key}</li>)
			}
			return (<ul className="mdc-list mdc-simple-menu__items">
				{inner}
				</ul>
			);
		}
	}

	ReactDOM.render(
		<List data={data}/>,
		document.getElementById('list-from-wrapper')
	);

	ReactDOM.render(
		<List data={data}/>,
		document.getElementById('list-to-wrapper')
	);
}

// SWAL

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
		preload();
	}
};

function main(data) {
	mdc.autoInit();
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
	document.querySelectorAll('.mdc-temporary-drawer__content > .mdc-list-item').forEach(item => item.addEventListener('click', function() {openWindow(this, drawer, list, innerDrawerChld)}));

	let val;

	select1.listen('MDCSelect:change', () => {
		calc(data, select1, select2, textfield1, textfield2);
	});
	select2.listen('MDCSelect:change', () => {
		calc(data, select1, select2, textfield1, textfield2);
	});

	swap.onclick = () => {swapHandler(data, select1, select2, textfield1, textfield2)};
	setInterval(checker, 10, data, select1, select2, textfield1, textfield2, val);

	setTimeout(() => {
		pageLoading.classList.add('off')
		pageMain.style.display = 'block';
	}, 20);
}

function openWindow(elem, drawer, list, innerDrawerChld) {
     let className = elem.dataset.window;
     list.forEach(item => item.style.display = 'none');
     document.querySelector(className).style.display = 'block';
     innerDrawerChld.forEach(item => item.classList.remove('mdc-temporary-drawer--selected'));
     elem.classList.add('mdc-temporary-drawer--selected');
     drawer.open = false;
}

// CALC

function calc(data, select1, select2, textfield1, textfield2) {
	const [coef, val, res] = countValCoefRes(data, textfield1, select1, select2);
	if (res === '') {
		removeVal(textfield2);
		return;
	}
	writeVal(val / coef, textfield2);
}

function countValCoefRes(data, textfield, select1, select2) {
	const from = select1.selectedText_.textContent,
		to = select2.selectedText_.textContent,
		fromObj = data.rates[from],
		toObj = data.rates[to],
		coef = fromObj / toObj,
		res = textfield.input_.value,
		val = parseFloat(res);
	return [coef, val, res];
}

function writeVal(val, textfield) {
	val = (!val) ? 0 : val;
	textfield.label_.classList.add('mdc-textfield__label--float-above');
	textfield.input_.value = val;
}

function removeVal(textfield) {
	textfield.label_.classList.remove('mdc-textfield__label--float-above');
	textfield.input_.value = '';
}

function checker(data, select1, select2, textfield1, textfield2, val) {
	let newVal = textfield1.input_.value;
	if (newVal != val && data.rates) {
		calc(data, select1, select2, textfield1, textfield2);
	}
	val = newVal;
}

// SWAP

function swapHandler(data, select1, select2, textfield1, textfield2) {
	let option1 = select1.selectedText_.textContent,
		option2 = select2.selectedText_.textContent;
		select1.selectedText_.textContent = option2;
		select2.selectedText_.textContent = option1;
	calc(data, select1, select2, textfield1, textfield2);
}

// FILE WRITE

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

// FILE READ

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

document.addEventListener('deviceready', preload, false);