let macys_product_view = new RegExp('.*www.macys.com\/shop\/product\/.*?ID=([0-9]+).*');
let macys_add_to_cart = new RegExp('.*www.macys.com\/bag\/atbpage.*');
let ebates_hotels = new RegExp('.*www\.ebates\.com\/hotels\/details\/.*\?hotelId=([0-9]+).*&arrivalDate=([0-9\/]+)&departureDate=([0-9\/]+).*');
let ritz = new RegExp('.*www\.ritzcarlton\.com\/en\/hotels\/canada\/toronto.*');
let macys_prefix = "cr::8333::";

function formatDate(inputDate) {
	var d = new Date(inputDate);
	var curr_date = d.getDate();
	var curr_month = d.getMonth();
	var curr_year = d.getFullYear();
	return curr_year + "-" + (curr_month+1) + "-" + curr_date;
}
function add_code(code) {
	let wrapper = `
	let readyStateCheckInterval = setInterval(function() {
		if (window.__fb_init !== undefined) {
			clearInterval(readyStateCheckInterval);
			${code}
		}
	}, 10);
	`;
	let s = document.createElement('script');
	s.textContent = wrapper;
	(document.head||document.documentElement).appendChild(s);
	// s.remove();
}

function ebates_hotel_view(hotelId, arrivalDate, departureDate) {
	let hotel_view_code = `
		console.log('Track hotel view event ${hotelId} arrive ${arrivalDate}, leave ${departureDate}');
		var params = {};
		params[FB.AppEvents.ParameterNames.CONTENT_TYPE] = 'hotel';
		params[FB.AppEvents.ParameterNames.CONTENT_ID] = '${hotelId}';
		params['fb_checkin_date'] = '${arrivalDate}';
		params['fb_checkout_date'] = '${departureDate}';
    FB.AppEvents.logEvent(
      FB.AppEvents.EventNames.VIEWED_CONTENT,
      null,
			params
    );
	`;
	add_code(hotel_view_code);
}

function ebates_hotel_view_pixel(hotelId, arrivalDate, departureDate) {
	let hotel_view_code = `
		console.log('Pixel: Track hotel view event ${hotelId} arrive ${arrivalDate}, leave ${departureDate}');
		fbq('track', 'ViewContent', {
	  content_type: 'hotel',
	  checkin_date: '${arrivalDate}',
	  checkout_date: '${departureDate}',
	  content_ids: '${hotelId}',
		num_adults: 2,
		num_children: 0
	});
	`;
	add_code(hotel_view_code);
}

function product_view(prefix) {
	let product_view_code = `
	  var productId = \"${prefix}\" + MACYS.brightTag.product.productID;
		console.log('FB page view event of product ' + productId);
		var params = {};
		params[FB.AppEvents.ParameterNames.CONTENT_TYPE] = 'product_group';
		params[FB.AppEvents.ParameterNames.CONTENT_ID] = productId;
    FB.AppEvents.logEvent(
      FB.AppEvents.EventNames.VIEWED_CONTENT,
      null,
			params
    );
	`;
	add_code(product_view_code);
}

function add_to_cart(prefix) {
	let add_to_bag_code = `
	  var productId = \"${prefix}\" + MACYS.Bag.addToBagPage.productId;
		console.log('FB add to cart event of product ' + productId);
		var params = {};
		params[FB.AppEvents.ParameterNames.CONTENT_TYPE] = 'product_group';
		params[FB.AppEvents.ParameterNames.CONTENT_ID] = productId;
		FB.AppEvents.logEvent(
			FB.AppEvents.EventNames.ADDED_TO_CART,
			null,
			params
		);
	`;
	add_code(add_to_bag_code);
}

function init_fb(){
	let fb_sript = document.createElement('script');
	fb_sript.src = chrome.extension.getURL('js/script.js');
	fb_sript.onload = function() {this.remove();};
	(document.head || document.documentElement).appendChild(fb_sript);
}

function add_reserve_event(){
	let reserve_event = `
	var buttons = document.getElementsByClassName('check-availability');
	for (let button of buttons) {
		button.addEventListener(
			'click',
			function() {
				console.log('Track to fb here');
				fbq('track', 'ViewContent', {
				  content_type: 'hotel',
				  checkin_date: '2018-1-27',
				  checkout_date: '2018-1-30',
				  content_ids: '365623',
					num_adults: 2,
					num_children: 0
				});
			},
			false
		);
	};`;
	add_code(reserve_event);
}

chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		init_fb();
		if (macys_product_view.test(window.location.href)) {
			 product_view(macys_prefix);
		}
		if (macys_add_to_cart.test(window.location.href)) {
			add_to_cart(macys_prefix);
		}

		if (ebates_hotels.test(window.location.href)) {
			let match = ebates_hotels.exec(window.location.href);
			ebates_hotel_view_pixel(match[1], formatDate(match[2]), formatDate(match[3]));
		}

		if (ritz.test(window.location.href)){
			console.log('adding check availability event to ritz');
			add_reserve_event();
		}
	}
	}, 10);
});
