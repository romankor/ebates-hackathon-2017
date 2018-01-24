let macys_product_view = new RegExp('.*www.macys.com\/shop\/product\/.*?ID=([0-9]+).*');
let macys_add_to_cart = new RegExp('.*www.macys.com\/bag\/atbpage.*');

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
	s.remove();
}

function product_view() {
	let product_view_code = `
	  var productId = MACYS.brightTag.product.productID;
		console.log('FB page view event of product ' + productId);
    var params = {};
    params[FB.AppEvents.ParameterNames.CONTENT_ID] = productId;
    FB.AppEvents.logEvent(
      FB.AppEvents.EventNames.VIEWED_CONTENT,
      null,
      params
    );
	`;
	add_code(product_view_code);
}

function add_to_cart() {
	let add_to_bag_code = `
	  var productId = MACYS.Bag.addToBagPage.productId;
		console.log('FB add to cart event of product ' + productId);
    var params = {};
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

chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		init_fb();
		if (macys_product_view.test(window.location.href)) {
			product_view();
		}
		if (macys_add_to_cart.test(window.location.href)) {
			add_to_cart();
		}
	}
	}, 10);
});
