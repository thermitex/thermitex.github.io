$(document).ready(function () {

    var cal = undefined;

    $.post("http://101.133.213.242/bk/urlstorage.jsp", {"mode": "r", "id": urltoken, "curdate": makeStandardDate(now)}, function(data, status) {
		if (status == "success") {
			cal = solveToken($.trim(data));
            if (cal) {
                romode = true;
                ROImport(cal);
                $(document).off("click", ".kill-button");
                $(document).off("click", ".cal-item");
                $(document).off("click", ".added-course-item");
                $("#course-input").val("").off().prop('disabled', true).hide();
                $("#import-button").off().hide();
                $("#clear-button").off().hide();
                $("#add-button").off().hide();
                $("#config").css("background-color", "rgb(230, 230, 230)");
                $("#config").css("color", "black");
                $(".added-course-item").css("border-color", "black");
                $("#sem1").addClass("reverse");
                $("#sem2").addClass("reverse");
                $("#min-button").css("background-color", "rgb(230, 230, 230)");
                $("#logo").attr("src", "ssp_logo_b.png");
                $("#data-sign").text("Preview Mode");
            } else {
                window.location = "/";
            }
		}
	});

    $(document).on("click", "#ro-import-button", function() {
        if (cal) importSolved(cal);
        window.location = "/";
    });
    
    $(document).on("click", "#quit-ro-button", function() {
       window.location = "/";
	});

});

function ROImport(res) {
    if (res.a) {
        sem1storage = res.a;
    } else {
        sem1storage = {};
        $("#sem1").hide();
        $("#sem1").off("click");
        selectSem("2");
    }
	if (res.b) {
        sem2storage = res.b;
    } else {
        sem2storage = {};
        $("#sem2").hide();
        $("#sem2").off("click");
        selectSem("1");
    }
    conflictStorage = res.c;
	closeDialog();
	render();
}