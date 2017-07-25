$(document).ready(function() {
	var rubInput = $('.input-rub');
	var plnInput = $('.input-pln');
	var selectFrom = $('.select-from');
	var selectTo = $('.select-to');
	var content = document.querySelector('.content');
	var spinner = document.querySelector('.spinner');
	var main = document.querySelector('.main');
	var data;

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
    spinner.style.display = 'none';
	main.style.justifyContent = 'flex-start';
	content.style.display = 'block';

		/*var log = '';
		for (var key in data.Valute) {
			log += '<option>' + key + '</option>\n';
		}
		console.log(log);*/
	}
	$('.submit').click(function() {
		var from = selectFrom.val();
		var to = selectTo.val();
		var coef = data.Valute[from].Value / data.Valute[to].Value;
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