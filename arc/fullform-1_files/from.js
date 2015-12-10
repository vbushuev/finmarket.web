(function(){
  var getTime = function (callback) {
		$.get(
			"./server/php/getTime.php", {
			type : "h"
		},
		function (data) {
      callback(data);
		});
	}
  
  var from = {
    settings:{
      cookieName : "from",
			cookieTime : 172800,
    },
    exception: {
      check: function(){
        return false;
      }
    },
    getFrom: function(){
      var allSearch = location.search.split("&");
      for (var i = 0; i < allSearch.length; i++) {
        if (allSearch[i].indexOf("from=") >= 0) {
          return ((allSearch[i]).split("="))[1];
        }
      }
      return false;
    },
    getCookie: function(){
      var c = +cookie.get(this.settings.cookieName);
			if (c >= 0) {
				return c;
			}
			return false;
    },
    setCookie: function(fromId){
      cookie.set(this.settings.cookieName, fromId, { expires : this.settings.cookieTime });
    },
    refreshCookie: function(){
      cookie.set(this.settings.cookieName, this.getCookie(), { expires : this.settings.cookieTime });
    },
    redirect: function(){
      var fromId = this.getCookie();
      var search = location.search.replace("?", "").split("&");
      for (var i = 0; i < search.length; i++) {
				if (search[i].indexOf("from=") >= 0) {
					search.splice(i, 1);
				}
			}
      if (fromId){
        search.push("from="+fromId);
      }
      location.search = "?" + search.join("&");
    },
    getState: function(){
      var userCookie = this.getCookie();
      var userFrom = this.getFrom();
      if ((userCookie == userFrom && userCookie)||(userCookie===0 && !userFrom)){
        return "ok";
      }
      if ((userCookie != userFrom && userCookie)||(userCookie===0 && userFrom)){
        return "redir";
      }
      if (this.exception.check()){
        return "exception";
      }
      if (!userCookie){
        return "cookie";
      }
    }
  }
  function firstUserLanding(){
    var state = from.getState();
    if (state == "ok"){
      from.refreshCookie();
    }
    else if (state == "redir"){
      from.redirect();
    }
    else if (state=="exception"){
      from.exception.handler(firstUserLanding);
    }
    else if (state == "cookie"){
      var userFrom = from.getFrom() || 0;
      from.setCookie(userFrom);
    }
  }
  firstUserLanding();
})();