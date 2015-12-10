//view
var error_css = {
	backgroundColor : "#fce3bb",
	border : "1px solid red"
};
var normal_css = {
	backgroundColor : "",
	border : ""
}

if (window.directory.indexOf("form_ke.php") >= 0) {
	$("#form_ke_OPF").change(function () {
		if ($(this).val() != "Индивидуальный предприниматель") {
			$("#form_ke_numberOfOwners").show();
			$("#form_ke_numberOfOwners").find("select").attr("req", "1");
		} else {
			$("#form_ke_numberOfOwners").hide();
			$("#form_ke_numberOfOwners").find("select").attr("req", "0");
		}
	});
	$("#form_ke_next").click(function () {
		var OPF = $("#form_ke_OPF").val() == "Индивидуальный предприниматель" ? "ip" : "comp";
		var numberOfOwners = +$("#form_ke_numberOfOwners").find("select").val();
		var auto = $("#form_ke_auto").val() == "Без залога" ? false : true;

		var validate = ke_start_validate();
		if (validate == "ok") {
			formRender(OPF, auto, numberOfOwners);
		} else {
			$("#formDiv_start").find(".error_section")
			.html("Не все обязательные поля заполнены корректно")
			.effect("highlight", {
				color : "rgb(252, 227, 187)"
			}, 1500);
			for (var i = 0; i < validate.length; i++) {
				validate[i].css(error_css);
			}
		}
	});
} else {
	formRender();
  $(document).ready(function(){
    formSpy.init($("#formDiv"), "form-avt-");
  });
}
var formSpy = {
    els: "",
    data: [],
    sett: {
      name: "",
      time: 365*24*60*60
    },
    set: function(el){
      var indx = this.els.index(el);
      this.data[indx] = el.val();
      cookie.set(this.sett.name+indx, this.data[indx], {expires: this.sett.time});
    },
    get: function(el){
      var indx = this.els.index(el);
      return cookie.get(this.sett.name+indx) || "";
    },
    init: function(div, cookieName){
      this.sett.name=cookieName;
      this.els = div.find("input, textarea");
      var this_ = this;
      this.els.each(function(){
        var el = $(this);
        el.val(this_.get(el));
        this_.set(el);
      });
      this.els.change(function(){
        this_.set($(this));
      });
    }
  }
function formRender(type, auto, owners) {
	if (window.directory.indexOf("form_ke.php") >= 0) {
		if (type == "ip" && auto) {
			var template = $("#form_ke_IP_auto").html(); ////////////////////////////
		} else if (type == "ip") {
			var template = $("#form_ke_IP_noauto").html();
		} else if (type == "comp" && auto) {
			var template = $("#form_ke_C_auto").html();
			var subTemplate = "";
			for (var i = 1; i <= owners; i++) {
				var subTemplate = subTemplate + $("#form_ke_owners").html().replace("{{num}}", i);
			}
			template = template.replace("{{OWNERS}}", subTemplate);
		} else if (type == "comp") {
			var template = $("#form_ke_C_noauto").html();
			var subTemplate = "";
			for (var i = 1; i <= owners; i++) {
				var subTemplate = subTemplate + $("#form_ke_owners").html().replace("{{num}}", i);
			}
			template = template.replace("{{OWNERS}}", subTemplate);
		}
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var ke_obj = {
			summ : $("#form_ke_summ").val(),
			goal : $("#form_ke_goal").val(),
			type : $("#form_ke_auto").val(),
			opf : $("#form_ke_OPF").val()
		}
		$("#formDiv_skin").html(template);
		ke_srart_app_init();
	} else {
		var ke_obj = false;
	}
	$("#formDiv_start").remove();
	formScript(ke_obj);
}

function formScript(ke_obj) {
	var form = {
		container : $("#formDiv"),
		tabs : $("#formDiv").find(".forms_tab"),
		buts : $("#formDiv").find(".button"),
		fields : [],
		state : 0
	}
	for (var i = 0; i < form.tabs.length; i++) {
		form.fields[i] = form.tabs.eq(i).find("[form-data]");
	}

	//controllers
	$("#form_personal_data_condition").click(function () {
		var text = $("#template-conditions").html();
		modal.show(text);
	});

	form.buts.click(function () {
    if ($(this).attr("direction")=="none"){
      return;
    }
		var direction = $(this).attr("direction") == "next" ? +1 : -1;
		var validate = form.validate();
		form.tabs.eq(form.state).find(".error_section").html("");
		if (validate == "ok" || direction == -1) {
			if ($(this).text() == "Отправить") {
				//TODO: AJAX-SEND
				var sendArr = [];
				if (ke_obj) {
					sendArr.push(encodeURIComponent("<h4>Информация о займе</h4>"));
					sendArr.push(encodeURIComponent("Лимит займа:* " + ke_obj.summ));
					sendArr.push(encodeURIComponent("Цель займа:* " + ke_obj.goal));
					sendArr.push(encodeURIComponent("Тип займа:* " + ke_obj.type));
					sendArr.push(encodeURIComponent("Организационно-правовая форма заемщика:* " + ke_obj.opf));
				}
				form.container.find("[form-data]").each(function () {
					var send = $(this).attr("form-data") == "header" ? "<h4>" + $(this).text().slice(0, $(this).text().indexOf("<br")) + "</h4>" : $(this).parent().find("span").text() + " " + ($(this).val());

					sendArr.push(encodeURIComponent(send));
				});
				$.post(
					"./server/mail/avtozalog_big.php", {
					loc : encodeURIComponent(window.directory_name),
					from : encodeURIComponent($("#from_mark").val()),
					arr : sendArr
				},
					function (data) {
					if (data == "ok") {
						direction = +1;
						form.state += direction;
						form.tabs
						.hide()
						.eq(form.state).show();
            yaCounter14063395.reachGoal('sendApplication');
						$("#form_send_result")
						.html("")
						.append("<h3>Спасибо!</h3>")
						.append("Заявка успешно отправлена на рассмотрение. Наш специалист позвонит Вам по телефону ")
						.append("<em>" + form.container.find("[form-data=tel]:first").val() + "</em> ")
						.append("в ближайшее время.");
					} else {
						modal.show("Что-то пошло не так и заявка не отправлена. Позвоните, пожалуйста, по телефону: <span class='white'>" + $("#from_mark").val() + "</span> для консультации специалиста.");
					}
				})

			} else {
				var scroll = form.tabs.eq(form.state).offset().top;
				$('html, body').animate({
					"scrollTop" : Math.min(scroll, $(window).scrollTop())
				}, 1000);

				form.state += direction;

				form.tabs
				.hide()
				.eq(form.state).show();

			}
		} else {
			form.tabs.eq(form.state).find(".error_section")
			.html("Не все обязательные поля заполнены корректно")
			.effect("highlight", {
				color : "rgb(252, 227, 187)"
			}, 1500);
			for (var i = 0; i < validate.length; i++) {
				validate[i].css(error_css);
			}
		}
	});
	$("#form_avtozalog_v_select").change(function () {
		if ($(this).val() == "Да") {
			$("#form_avtozalog_v_text").hide();
			$("#form_avtozalog_v_text").find("textarea").attr("req", "0");
		} else {
			$("#form_avtozalog_v_text").show();
			$("#form_avtozalog_v_text").find("textarea").attr("req", "5");
		}
	});

	//validation
	form.validate = function () {
		var error = [];
		var inp = this.fields[this.state];
		inp.css(normal_css);
		for (var i = 0; i < inp.length; i++) {
			var req_length = +inp.eq(i).attr("req");

			if (inp.eq(i).val().length < req_length) {
				error.push(inp.eq(i));
			}
		}

		if (form.state == form.tabs.length - 2) {
			$("#form_personal_data_check").next("span").css(normal_css);
			var check = $("#form_personal_data_check").prop("checked");
			if (!check) {
				error.push($("#form_personal_data_check").next("span"));
			}
		}

		return error.length == 0 ? "ok" : error;
	}
}

var ke_start_validate = function () {
	var error = [];
	var inp = $("#formDiv_start").find("input, select");
	inp.css(normal_css);
	for (var i = 0; i < inp.length; i++) {
		var req_length = +inp.eq(i).attr("req");

		if (inp.eq(i).val().length < req_length) {
			error.push(inp.eq(i));
		}
	}
	return error.length == 0 ? "ok" : error;
}

var ke_srart_app_init = function () {
	(function () {
		var inp = $("[tooltip]");
		inp.focus(function () {
			var obj = $(this).next(".tooltip");
			if (obj.length == 0) {
				$(this).after("<div class='tooltip'>" + $(this).attr("tooltip") + "</div>");
				obj = $(this).next(".tooltip");
				var h = -40 - obj.height() - 2 * $(this).height();
				var l = $(this).offset().left;
				obj
				.css({
					marginTop : h + "px",
					marginLeft : l + "px"
				})
				.show();
			} else {
				var h = -40 - obj.height() - 2 * $(this).height();
				var l = $(this).offset().left;
				obj
				.css({
					marginTop : h + "px",
					marginLeft : l + "px"
				})
				.show();
			}
		});
		inp.blur(function () {
			$(this).next(".tooltip").hide();
		});
	})();
	//inputs validation
	$("[type=tel], [type=number]").on('keypress', function (e) {
		var now = $(this).attr("type");

		if (now == "tel" || now == "number") {
			var key = (typeof e.charCode == 'undefined' ? e.keyCode : e.charCode);
			// Ignore special keys
			if (e.ctrlKey || e.altKey || key < 32) {
				return true;
			}
			key = String.fromCharCode(key);
			var res = /\d/.test(key);
			return res;
		}
	});

	//inputmask
	$("[mask]").each(function () {
		var mask = $(this).attr("mask");
		$(this).inputmask({
			"mask" : mask
		});
	});
}
