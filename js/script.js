window.fbAsyncInit = function() {
    FB.init({
      appId            : '918684218291334',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v2.11'
    });
    console.log('init FB');
    window.__fb_init = true;
    fbq('init', '184686215615625');

};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
