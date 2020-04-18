
function getValidationRules(form) {
	var rules = {};
	form.find(".answer-field, .auth-answer-field").each((i, v) => {
		var requiredRules = { required : true };
		if ($(v).attr("required"))
			$(v).removeAttr("required");
		else if ($(v).data("vaidation-rules")) {
			var validationStr = $(v).data("vaidation-rules")
			requiredRules = validationStr
		}
		rules[$(v).attr("name")] = requiredRules;
	});
	return rules;
}

var formId = [
	"#login",
	"#edit_form_submit",
	"#projectformsubmit",
	"#employeeSearchForm",
	"#employeeformsubmit"
];
formId.forEach( function(item) {
	if ($(item).is(":visible")) {
		$(item).validate({
			ignoreTitle: true,
			validClass: "success",
			errorClass: "error",
			rules: getValidationRules($(item)),
			errorPlacement: function ( error, element ) {
				$(element).closest(".form-group").append(error.addClass("error-block col-sm-12"));
			},
			highlight: function ( element, errorClass, validClass ) {
				$(element).closest(".form-group").addClass("has-error").removeClass("has-success");
			},
			unhighlight: function (element, errorClass, validClass) {
				$(element).closest(".form-group").addClass("has-success").removeClass("has-error");
			}
		});
	}
});

$.validator.addMethod("validEmail", function(value, element) {
	var re = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
	return this.optional(element) || re.test(value);
}, "Please enter a valid Email");

$(document).on('click', '.employmentFormsubmit, .projectFormsubmit, .loginFormsubmit', function(e) {
	e.preventDefault();
	var $this = $(e.currentTarget);
	if ($this.valid()) {
		var data = $this.closest("form").serialize();
		$.ajax({
			url: $this.closest("form").attr("action"),
			method: "POST",
			data: data,
			success: function(res) {
				console.log(res);
				if (res.status == "success") {
					window.location = $this.closest("form").data("redirecturl");
				} else {
					if (res.data && res.data.data && res.data.data.message)
						$(".servererror").text(res.data.data.message);
					else
						$(".servererror").text("Oops something went wrong! Please try again later.");
				}
			} 
		});
	}
});

$(document).on('click', '.searchBtn', function(e) {
	e.preventDefault();
	var $this = $(e.currentTarget);
	if ($this.closest("form").valid()) {
		var url = $this.closest("form").attr("action");
		if (url.includes("employment")) {
			url = url+'/'+$('[name="employee_name"] option:selected').val() + '/' +$('[name="lead_employee_id"] option:selected').val()
		} else {
			url = url+'/'+$('[name="project_name"] option:selected').val() + '/' +$('[name="criteria"] option:selected').val()
			
		}
		$.ajax({
			url: url,
			method: "GET",
			data: {},
			success: function(res) {
				if (res.status == "success") {
					$(".tablelookup").html(res.data);
					$('table').DataTable();
				} else {
					$(".servererror").text("Oops something went wrong! Please try again later.");
				}
			} 
		});
	}
});

$("#editFormsubmitBtn").on("click", e => {
	e.preventDefault();
	var $this = $(e.currentTarget);
	var data = $("form#edit_form_submit").serialize();
	if ($this.valid()) {
		$("#edit_form_submit").submit();
	}
});
$(".datepicker").datepicker({dateFormat: "dd-mm-yy"});
$('table').DataTable();
$('.select2').select2();