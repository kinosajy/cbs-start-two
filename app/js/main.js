//модальное окно
$(document).ready(function() { 
	$('a#go').click( function(event){ 
		event.preventDefault(); 
		$('#overlay').fadeIn(0, 
		 	function(){
				$('#modal_form') 
					.css('display', 'block') 
					.animate({opacity: 1, top: '50%'}, 0); 
		});
	});

	$('#modal_close, #overlay, #post_submit').click( function(){ 
		$('#modal_form')
			.animate({opacity: 0, top: '45%'}, 0,  
				function(){ 
					$(this).css('display', 'none'); 
					$('#overlay').fadeOut(0); 
				}
			);
	});
});

// ttabs
jQuery.fn.ttabs = function (options) {

  var options = jQuery.extend({

    activeClass: 'active-ttab' // Класс активной вкладки

  }, options);

  return this.each(function () {

    $(this).find('.tt-panel:first').show(0);
    $(this).find('.index-tabs span:first').addClass(options.activeClass);

    $(this).find('.index-tabs span').click(
      function () {
        $(this).parent().parent().find('.index-panel .tt-panel').hide(0);
        var numEl = $(this).index();
        $(this).parent().parent().find('.index-panel .tt-panel').eq(numEl).fadeIn(500);
        $(this).parent().find('span').removeClass(options.activeClass);
        $(this).addClass(options.activeClass);
      }
    );

  });

};

$(document).ready(function () {
	$('.tt-tabs').ttabs();
});

