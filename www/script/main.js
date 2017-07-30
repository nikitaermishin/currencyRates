$(document).ready(function() {
	var rubInput = $('.input-rub');
	var plnInput = $('.input-pln');
	var selectFrom = $('.select-from');
	var selectTo = $('.select-to');
	var content = document.querySelector('.content');
	var spinner = document.querySelector('.spinner');
	var main = document.querySelector('.main');
	var data;

	/*function ajax() {
		var req = new XMLHttpRequest();
	    req.open('GET', 'https://www.cbr-xml-daily.ru/daily_json.js', false);
		req.send();
		if (req.status !== 200) {
			console.log('Error');
		} else {
			data = JSON.parse(req.responseText);
			data.Valute.RUB = {
				Value: 1
			};
	    

			/*var log = '';
			for (var key in data.Valute) {
				log += '<option>' + key + '</option>\n';
			}
			console.log(log);
		}
	}*/

	/*while (!checkConnection) {
		console.log('no WIFI');
	}

	$.getJSON("https://www.cbr-xml-daily.ru/daily_json.js", function(result){
      $.each(result, function(i, field){
        data = field;
     });
    });*/

    var requestFunc = function() {
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

  //   promise.then(function(json) {
  //   	return JSON.parse(json);
  //   }).then(function(obj) {
  //   	data = obj.Valute;
  //   	data.RUB = {
  //   		Value: 1
  //   	}
  //   	console.log(data);
  //   }).catch(function(err) {
  //   	console.log(Error(err));
  //   }).then(function() {
  //   	spinner.style.display = 'none';
		// main.style.justifyContent = 'flex-start';
		// content.style.display = 'block';
  //   });

    async function getValutes(request) {
    	try {
	    	let promise = await requestFunc();
	    	let obj = JSON.parse(promise);
	    	data = obj.Valute;
	    	data.RUB = {
	    		Value: 1
	    	}
    		console.log(data);
    	} catch (e) {
    		console.error(e);
    	}
    	spinner.style.display = 'none';
		main.style.justifyContent = 'flex-start';
		content.style.display = 'block';
    }

    getValutes();


/*
	spinner.style.display = 'none';
	main.style.justifyContent = 'flex-start';
	content.style.display = 'block';*/

	$('.submit').click(function() {
		var from = selectFrom.val();
		var to = selectTo.val();
		var coef = data[from].Value / data[to].Value;
		var rubVal = parseFloat(rubInput.val());
		var plnVal = parseFloat(plnInput.val());
		if (plnVal) {
			rubInput.parent().addClass('is-dirty');
			rubInput.val(plnVal * coef);
		} else if (rubVal) {
			plnInput.parent().addClass('is-dirty');
			plnInput.val(rubVal / coefs);
		}
	});
});