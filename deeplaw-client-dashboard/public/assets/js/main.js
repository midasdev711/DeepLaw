(function ($) {
	"use strict";
    jQuery(document).ready(function($){

		/*=========================
  		PreLoader
		===========================*/
	    $(window).on('load', function(event) {
	    $('.proloader').delay(500).fadeOut(500);
	    });


		/*=========================
  		OwlCarousel-slider
		===========================*/
		$('.testimonial-active').owlCarousel({
		    loop:true,
			items:1,
			autoplayTimeout:3000,
	    	smartSpeed:1000,
	    	autoplay:true,
		})


	$('.hamburger-menu').on('click', function(){
	    $('.hamburger-menu .line-top').toggleClass('current');
	    $('.hamburger-menu .line-center').toggleClass('current');
	    $('.hamburger-menu .line-bottom').toggleClass('current');
	});




	$('.hamburger-menu').on('click', function(){
	    $('.mobile-menu').toggleClass('current');
	});


	$('.mobile-menu li').on('click', function(){
	    $('.mobile-menu').toggleClass('current');
	});


	$(".complete").slideUp();
    $(".completeb").slideUp();
    $("#read-btn").click(function() {
        if ($(this).hasClass("read_more")) {
            $(this).children().css("transform","rotate(180deg)");
            $(".complete").slideDown();
            $(this).removeClass("read_more");
        }
        else{
            $(this).children().css("transform","rotate(0deg)");
            $(".complete").slideUp();
            $(this).addClass("read_more");
        }
    });
    $("#read-btnb").click(function() {
        
        if ($(this).hasClass("read_more")) {
            $(this).children().css("transform","rotate(180deg)");
            $(".completeb").slideDown();
            $(this).removeClass("read_more");
        }
        else{
            $(this).children().css("transform","rotate(0deg)");
            $(".completeb").slideUp();
            $(this).addClass("read_more");
        }
    });

    // Functions Code
	function get_total_price() {
		var $x = 0
		$(".cd-popular").each(function() {
			$x += Number($(this).find("a.cd-select").attr("data-value"));
		});
		if ($("#add-box")[0].checked) {
			$x += Number($("#add-box").attr("data-value"));
		}
		return "$" + $x;
	} 


	// Jquery Code
	$("a.cd-select").click(function() {
		$(this).parents("ul.cd-pricing-list").find(".cd-popular").removeClass("cd-popular");
		$(this).parents("ul.cd-pricing-list > li").addClass("cd-popular");
	});


	// Total Price 
	// $("#Checkout").click(function(){
	// 	alert(get_total_price());
	// });





	});
	

	//switch from monthly to annual pricing tables
	bouncy_filter($('.cd-pricing-container'));

	function bouncy_filter(container) {
		container.each(function(){
			var pricing_table = $(this);
			var filter_list_container = pricing_table.children('.cd-pricing-switcher'),
				filter_radios = filter_list_container.find('input[type="radio"]'),
				pricing_table_wrapper = pricing_table.find('.cd-pricing-wrapper');

			//store pricing table items
			var table_elements = {};
			filter_radios.each(function(){
				var filter_type = $(this).val();
				table_elements[filter_type] = pricing_table_wrapper.find('li[data-type="'+filter_type+'"]');
			});

			//detect input change event
			filter_radios.on('change', function(event){
				event.preventDefault();
				//detect which radio input item was checked
				var selected_filter = $(event.target).val();

				//give higher z-index to the pricing table items selected by the radio input
				show_selected_items(table_elements[selected_filter]);

				//rotate each cd-pricing-wrapper 
				//at the end of the animation hide the not-selected pricing tables and rotate back the .cd-pricing-wrapper
				
				if( !Modernizr.cssanimations ) {
					hide_not_selected_items(table_elements, selected_filter);
					pricing_table_wrapper.removeClass('is-switched');
				} else {
					pricing_table_wrapper.addClass('is-switched').eq(0).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {		
						hide_not_selected_items(table_elements, selected_filter);
						pricing_table_wrapper.removeClass('is-switched');
						//change rotation direction if .cd-pricing-list has the .cd-bounce-invert class
						if(pricing_table.find('.cd-pricing-list').hasClass('cd-bounce-invert')) pricing_table_wrapper.toggleClass('reverse-animation');
					});
				}
			});
		});
	}
	function show_selected_items(selected_elements) {
		selected_elements.addClass('is-selected');
	}

	function hide_not_selected_items(table_containers, filter) {
		$.each(table_containers, function(key, value){
	  		if ( key != filter ) {	
				$(this).removeClass('is-visible is-selected').addClass('is-hidden');

			} else {
				$(this).addClass('is-visible').removeClass('is-hidden is-selected');
			}
		});
	}


    jQuery(window).load(function(){});
}(jQuery));	