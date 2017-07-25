$(document).ready(function() {
	var count = 0;
	var taskArr = [];

	$('#search-button').css('display', 'none');
	$('#add-button').click(enableAddMenu);
	$('#clear-button').click(enableMain);
	$('#add-task-button').click(addTask);
	$('#addMenu-button').click(enableAddMenu);
	$('#main-button').click(enableMain);
	$('#task-list').sortable();

	function enableAddMenu() {
		$('.page-main').css('display', 'none');
		$('.page-addMenu').css('display', 'flex');
		$('.mdl-layout-title').html('Add new task');
		//$('#search-button').css('display', 'none');
		$('#clear-button').css('display', 'block');
	}

	function enableMain() {
		$('.page-addMenu').css('display', 'none');
		$('.page-main').css('display', 'block');
		$('.mdl-layout-title').html('Todo');
		$('#clear-button').css('display', 'none');
		//$('#search-button').css('display', 'block');
	}

	function addTask() {
		var name = $('#name-input').val();
		var urgent = $('#checkbox-urgent:checked').length;
		var elemContent = '<li><section class="task section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp"><div class="task__titleWrapper"><h4 class="task__name">' + name + '</h4>' + (urgent ? '<span class="mdl-chip"><span class="mdl-chip__text">urgent</span></span>' : '') + '</div><div class="task__checkboxWrapper"><label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect task__label mdl-js-ripple-effect--ignore-events is-upgraded" for="checkbox-' + count + '" data-upgraded=",MaterialCheckbox,MaterialRipple"><input type="checkbox" id="checkbox-' + count + '" class="mdl-checkbox__input task__checkbox"><span class="mdl-checkbox__focus-helper"></span><span class="mdl-checkbox__box-outline"><span class="mdl-checkbox__tick-outline"></span></span><span class="mdl-checkbox__ripple-container mdl-js-ripple-effect mdl-ripple--center" data-upgraded=",MaterialRipple"><span class="mdl-ripple"></span></span></label></div></section></li>';//
		if (urgent) {
			$(elemContent).prependTo('#task-list');
		} else {
			$(elemContent).appendTo('#task-list');
		}
		$('.mdl-checkbox__ripple-container.mdl-js-ripple-effect.mdl-ripple--center .mdl-ripple').click(function() {
			$(this).parent().parent().toggleClass('is-checked');
		});
		enableMain();
		$('#name-input').val('');
		count++;
	}
});