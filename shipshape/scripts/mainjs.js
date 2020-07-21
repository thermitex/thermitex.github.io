var sem = "sem1";
var sem1storage = {};
var sem2storage = {};
var conflictStorage = [];
var temp = {};
var tempcc = "";
var romode = false;

$(document).ready(function () {

	adjustPage();

	if (typeof(Storage) !== "undefined") {
		if (localStorage.getItem("sem1") == undefined) {
			localStorage.setItem("sem1", "{}");
		} else {
			try {
				sem1storage = JSON.parse(localStorage.getItem("sem1"));
			} catch (error) {
				showDialog(errorStr(error));
				localStorage.setItem("sem1", "{}");
			}
		}
		if (localStorage.getItem("sem2") == undefined) {
			localStorage.setItem("sem2", "{}");
		} else {
			try {
				sem2storage = JSON.parse(localStorage.getItem("sem2"));
			} catch(error) {
				showDialog(errorStr(error));
				localStorage.setItem("sem2", "{}");
			}
		}
		if (localStorage.getItem("conf") == undefined) {
			localStorage.setItem("conf", "[]");
		} else {
			try {
				conflictStorage = JSON.parse(localStorage.getItem("conf"));
			} catch(error) {
				showDialog(errorStr(error));
				localStorage.setItem("conf", "[]");
			}
		}
		if (localStorage.getItem("sem") == undefined) {
			localStorage.setItem("sem", "1");
		} else {
			selectSem(localStorage.getItem("sem"));
		}
		render();
	}

	$("#course-input").bind('keyup', function () {
		searchCourse($(this).val());
		$("#course-result-wrapper").show("fast");
	});

	$(document).mouseup(function (e) { 
        var ct1 = $("#course-search-widget,#sub-result-wrapper");
        var ct2 = $("#sub-result-wrapper"); 
        if(!ct1.is(e.target) && ct1.has(e.target).length === 0) { 
            $("#course-result-wrapper").hide("fast"); 
			$("#sub-result-wrapper").hide("fast");
			clearTemp();
        }
        if(!ct2.is(e.target) && ct2.has(e.target).length === 0) { 
			$("#sub-result-wrapper").hide();
			clearTemp();
        } 
    });

    $(document).on("click", ".course-result-item", function() {
    	$("#sub-result-wrapper").css("top", $(this).offset().top).css("left", 360);
		$("#sub-result-view").css("max-height", window.innerHeight - $(this).offset().top - 50);
		var cc = $(this).attr('id');
    	getSub(cc);
	});
	
	$(document).on("click", ".cal-item", function(e) {
		e.preventDefault();
		$("#sub-result-wrapper").css("top", e.pageY).css("left", e.pageX);
		var cc = $(this).attr('class').split(" ")[2].split("r")[1];
    	getSubMenu(e, cc, $(this).hasClass("addevent"), $(this).attr('class'));
	});
	
	$(document).on("click", ".added-course-item", function() {
		var orgtop = $(this).offset().top;
		$("#sub-result-wrapper").css("top", orgtop).css("left", 360);
		var cc = $(this).attr('class').split(" ")[2].split("r")[1];
    	getSubSide(cc, orgtop);
    });

	$("#course-input").focus(function() {
		if ($(this).val() != "") {
			searchCourse($(this).val());
			$("#course-result-wrapper").show("fast");
		}
	});

	$("#sem1").click(function() {
		selectSem("1");
	});

	$("#sem2").click(function() { 
		selectSem("2");
	});

	$(document).on("click", ".subs", function() {
		if ($(this).hasClass("selected")) {
			deleteStorage($(this).attr("id").split("-")[0]);
			$(this).removeClass("selected");
		} else {
			$(".subs").removeClass("selected");
			$(this).addClass("selected");
			getTimeSlotsAndSave($(this).attr("id"), $(this).hasClass("conflict"));
		}
	})

	$(document).on("mouseenter", "#sub-list", function() {
		$("#sub-result-wrapper").addClass("transp");
	}).on("mouseleave", "#sub-list", function() {
		$("#sub-result-wrapper").removeClass("transp");
	});

	$(document).on("mouseenter", ".subs", function() {
		if (!$(this).hasClass("selected")) subMouseIn($(this).attr("id"), $(this).hasClass("conflict"));
	}).on("mouseleave", ".subs", function() {
		if (!$(this).hasClass("selected")) subMouseOut();
	});

	$(document).on("mouseenter", ".added-course-item", function() {
		if (!romode) $(this).find(".kill-button").fadeIn("fast");
		var c = $(this).attr("class").split(" ")[2];
		$("."+c).addClass("hover");
	}).on("mouseleave", ".added-course-item", function() {
		if (!romode) $(this).find(".kill-button").hide();
		var c = $(this).attr("class").split(" ")[2];
		$("."+c).removeClass("hover");
	});

	$(document).on("mouseenter", ".cal-item", function() {
		var c = $(this).attr("class").split(" ")[2];
		if (c) $("."+c).addClass("hover");
	}).on("mouseleave", ".cal-item", function() {
		var c = $(this).attr("class").split(" ")[2];
		if (c) $("."+c).removeClass("hover");
	});

	$(document).on("click", ".kill-button", function(e) {
		e.stopPropagation();
		var delcc = $(this).attr("id").split("-")[1];
		deleteStorage(delcc);
	});

	$(document).on("click", ".delete-cal-button", function(e) {
		e.stopPropagation();
		var delcc = $(this).attr("id").split("-")[1];
		deleteStorage(delcc);
		$("#sub-result-wrapper").hide();
	});

	$(document).on("click", ".delete-event-button", function(e) {
		var delcc = $(this).attr("id").split("-")[1];
		deleteStorage(delcc);
		$("#sub-result-wrapper").hide();
	});

	$(document).on("click", ".edit-event-button", function(e) {
		var editcc = $(this).attr("id").split("-")[1];
		showEditEvent(editcc);
		$("#sub-result-wrapper").hide();
	});

	$("#about-button").click(function() {
		showDialog(aboutDialogStr(), $(this).offset().left, $(this).offset().top+25, 280);
	});

	$("#donate-button").click(function() {
		window.open("donate");
	});

	$("#export-button").click(function() {
		showDialog(exportDialogStr(), $(this).offset().left, $(this).offset().top+25, 380);
		var token = generateToken(false)
		$("#token-text").val(token);
		$("#untildate").val(today);
		$(".export-token").hide();
		$(".export-url").hide();
	});

	$("#import-button").click(function() {
		showDialog(importDialogStr(), $(this).offset().left, $(this).offset().top+25, 320);
	})

	$("#clear-button").click(function() {
		showDialog(clearDialogStr(), $(this).offset().left, $(this).offset().top+25, 280);
	});

	$("#add-button").click(function() {
		showDialog(addDialogStr(), $(this).offset().left, $(this).offset().top+25, 320);
	});

	$("#close-dialog-button").click(function() {
		closeDialog();
	})

	$("#dialog-mask").click(function() {
		closeDialog();
	})

	$(document).on("change", "#url-form", function() {
		$("#url-text").val("Link Not Generated");
		$("#url-gen-button").removeClass("unselectable").text("Generate Link");
	});

	$(document).on("change", "#token-form", function() {
		var token = generateToken($("#token-both-sem").is(':checked'));
		$("#token-text").val(token);
	});

	$(document).on("click", "#token-copy-button", function() {
		$("#token-text").select();
		document.execCommand("copy");
	});

	$(document).on("click", "#url-copy-button", function() {
		$("#url-text").select();
		document.execCommand("copy");
	});

	$(document).on("click", "#export-token", function() {
		$(".export-url").hide();
		$(".export-token").show();
		$(".export-cal").hide();
		$(".export-options.selected").removeClass("selected");
		$("#export-token").addClass("selected");
	});

	$(document).on("click", "#export-cal", function() {
		$(".export-url").hide();
		$(".export-token").hide();
		$(".export-cal").show();
		$(".export-options.selected").removeClass("selected");
		$("#export-cal").addClass("selected");
	});

	$(document).on("click", "#export-url", function() {
		$(".export-token").hide();
		$(".export-cal").hide();
		$(".export-url").show();
		$(".export-options.selected").removeClass("selected");
		$("#export-url").addClass("selected");
	});

	$(document).on("click", "#url-gen-button", function() {
		if ($(this).hasClass("unselectable")) return;
		$("#url-text").val("Generating...");
		var token = generateToken($("#url-both-sem").is(':checked'))
		buildURL(token);
	});

	$(document).on("click", "#confirm-clear-button", function() {
		localStorage.clear();
		localStorage.setItem("sem1", "{}");
		localStorage.setItem("sem2", "{}");
		localStorage.setItem("conf", "[]");
		selectSem("1");
		sem1storage = {};
		sem2storage = {};
		conflictStorage = [];
		closeDialog();
		render();
	});

	$(document).on("click", "#token-import-button", function() {
		if ($("#import-text").val() != '') {
			var res = solveToken($("#import-text").val());
			if (res) {
				importSolved(res);
			} else {
				$("#import-warning").html("Error: Corrupted token<br>Please consider regenerating another token and paste in full.");
			}
		}
	});

	$(document).on("click", "#min-button", function() {
		$("#config").hide();
		$("#min-button").hide();
		$("#max-button").show();
		$("#footer").css("width", "calc(100% - 30px)");
		render();
	});

	$(document).on("click", "#max-button", function() {
		$("#config").show();
		$("#max-button").hide();
		$("#min-button").show();
		$("#footer").css("width", "calc(100% - 430px)");
		render();
	});

	$(document).on("click", "#confirm-add-button", function() {
		if ($(this).text() == "Update")
			addEvent($(this).attr("class").split(" ")[2]);
		else
			addEvent();
	});

	$(document).on("click", "#err-okay-button", function() {
		closeDialog();
	});

	$(window).resize(function() {
		renderCal();
	});

});

function adjustPage() {
	$("#cal-header").css("margin-right", $("#cal-header").width() - $(".cal-Content").eq(0).width() + 28);
	let tdheight = ($("#cal-content-wrapper").height()- 160) / 56 < 16 ? 16 : ($("#cal-content-wrapper").height()- 160) / 56;
	$(".cal-Content td").height(tdheight);
}

function selectSem(n) {
	if (n == "2") {
		sem = "sem2";
		$("#sem2").addClass("sem-selected");
		$("#sem1").removeClass("sem-selected");
	} else {
		sem = "sem1";
		$("#sem1").addClass("sem-selected");
		$("#sem2").removeClass("sem-selected");
	}
	localStorage.setItem("sem", n);
	render();
}

function searchCourse(str) {
	$.get("http://101.133.213.242/bk/searchcourse.jsp", {"input": str, "sem": sem}, function(data, status) {
		if (status == "success") {
			if (!$.trim(data)) {
				$("#course-result-wrapper").hide();
			} else {
				$("#match-list").html(data);
			}
		}
	});
}

function getSub(cc) {
	$.get("http://101.133.213.242/bk/getsub.jsp", {"cc": cc, "sem": sem}, function(data, status) {
		if (status == "success") {
			$("#sub-result-view").html(data);
			$("#sub-result-wrapper").css("transition", "none");
			$("#sub-result-wrapper").show("fast", function() {
				$("#sub-result-wrapper").css("transition", "0.2s");
				setMask();
			});
			checkSubSelected(cc);
			subHoldAndCompare(cc);
		}
	});
}

function getSubMenu(e, cc, addevent, str) {
	var indpevent = false;
	if ($("#sub-result-view").width() == 150) $("#sub-result-view").width("300px");
	$.get("http://101.133.213.242/bk/getsub.jsp", {"cc": cc, "sem": sem}, function(data, status) {
		if (status == "success") {
			$("#sub-result-view").html(data);
			if (addevent) {
				if (str.split(" ")[3] == "addevent") {
					indpevent = true;
					var id = str.split(" ")[2].split("i")[1];
					$("#sub-result-view").html('<div id="cedit-'+id+'" class="edit-event-button selectable"><p>Edit this event</p></div>'+'<div id="cdel-'+id+'" class="delete-event-button selectable"><p>Delete this event</p></div>');
				} else {
					var id = str.split(" ")[3].split("i")[1];
					$("#sub-result-view").append('<div id="cdel-'+id+'" class="delete-event-button selectable"><p>Delete this event</p></div>');
					$("#sub-result-view").append('<div id="cedit-'+id+'" class="edit-event-button selectable"><p>Edit this event</p></div>');
					$(".edit-event-button").insertAfter("#sub-result-title");
					$(".delete-event-button").insertAfter(".edit-event-button");
				}
			}
			$("#sub-result-wrapper").css("transition", "none");
			$("#sub-result-wrapper").show();
			if (indpevent) $("#sub-result-view").width("150px");
			if ($("#sub-result-view").height() > window.innerHeight - e.pageY - 50) {
				$("#sub-result-wrapper").css("top", e.pageY - $("#sub-result-view").height());
			}
			if ($("#sub-result-view").width() > window.innerWidth - e.pageX - 40) {
				$("#sub-result-wrapper").css("left", e.pageX - $("#sub-result-view").width());
			}
			$("#sub-result-wrapper").hide();
			$("#sub-result-wrapper").show("fast", function() {
				$("#sub-result-wrapper").css("transition", "0.2s");
				if (!indpevent) setMask();
			});
			checkSubSelected(cc);
			subHoldAndCompare(cc);
			if (!indpevent) $(".delete-cal-button").show();
		}
	});
}

function getSubSide(cc, orgtop) {
	$.get("http://101.133.213.242/bk/getsub.jsp", {"cc": cc, "sem": sem}, function(data, status) {
		if (status == "success") {
			$("#sub-result-view").html(data);
			$("#sub-result-wrapper").css("transition", "none");
			$("#sub-result-wrapper").show();
			if ($("#sub-result-view").height() > window.innerHeight - orgtop - 50) {
				$("#sub-result-wrapper").css("top", orgtop - $("#sub-result-view").height() + 65);
			}
			$("#sub-result-wrapper").hide();
			$("#sub-result-wrapper").show("fast", function() {
				$("#sub-result-wrapper").css("transition", "0.2s");
				setMask();
			});
			checkSubSelected(cc);
			subHoldAndCompare(cc);
		}
	});
}

function getTimeSlotsAndSave(str, conflict=false) {
	var det = str.split("-");
	var cc = det[0];
	var sub = det[1];
	$.get("http://101.133.213.242/bk/gettimeslots.jsp", {"cc": cc, "sub": sub, "sem": sem}, function(data, status) {
		if (status == "success") {
			var tdata = $.trim(data);
			var datalist = tdata.split("\t");
			var title = datalist[0];
			var stor = (sem == "sem1" ? sem1storage : sem2storage);
			if (typeof(Storage) !== "undefined") {
				if (stor[cc] == undefined) {
					var course = {};
					var timeslots = [];
					course.title = title;
					for (let i = 1; i < datalist.length; i++) {
						timeslots.push(datalist[i]);
					}
					course.ts = timeslots;
					course.sub = sub;
					stor[cc] = course;
				} else {
					var timeslots = [];
					stor[cc].title = title;
					for (let i = 1; i < datalist.length; i++) {
						timeslots.push(datalist[i]);
					}
					stor[cc].ts = timeslots;
					stor[cc].sub = sub;
					if (conflictStorage.includes(cc)) {
						var prevConf = conflictStorage.map((x) => x);
						conflictStorage = [];
						prevConf.forEach(confcc => {
							if (confcc != cc) {
								for (let i = 0; i < stor[confcc].ts.length; i++) {
									recalcConflict(confcc, stor[confcc].ts[i], i, cc);
								}
							}
						});
						localStorage.setItem("conf", JSON.stringify(conflictStorage));
					}
				}
				if (conflict) {
					if (!conflictStorage.includes(cc)) conflictStorage.push(cc);
					for (let i = 0; i < stor[cc].ts.length; i++) {
						minWiseComparison(cc, stor[cc].ts[i], i);
					}
				}
				localStorage.setItem(sem, JSON.stringify(stor));
				localStorage.setItem("conf", JSON.stringify(conflictStorage));
				render();
			}
		}
	});
}

function getTimeSlotsAndHold(cc, str) {
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	$.get("http://101.133.213.242/bk/gettsbatch.jsp", {"cc": cc, "sub": str, "sem": sem}, function(data, status) {
		if (status == "success") {
			temp = JSON.parse($.trim(data));
			Object.keys(temp).forEach(sub => {
				tsl = temp[sub];
				tsl.forEach(tse => {
					Object.keys(stor).forEach(scc => { 
						if (cc != scc) {
							stor[scc].ts.forEach(stse => {
								if (compareTS(tse, stse)) {
									let helptxt = "Conflict with " + scc + "-" + stor[scc].sub;
									$("#"+cc+"-"+sub).addClass("conflict").attr("title", helptxt);
								}
							});
						}
					});
				});
			});
			$("#loading-mask").hide();
		}
	});
}

function recalcConflict(cc, ts, tsi, ignorecc=undefined) {
	var tsls = ts.split(",");
	var stime = tsls[2];
	var etime = tsls[3];
	var curwdd = parseInt(tsls[4]);
	var curord = parseInt(tsls[5]);
	var sh = stime.split(":")[0];
	var sm = stime.split(":")[1];
	var eh = etime.split(":")[0];
	var em = etime.split(":")[1];
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	var maxwdd = 1;
	var takenup = [];
	for (let hr = sh; hr <= eh; hr++) {
		for (let min = (hr == sh ? sm : 0); min <= (hr == eh ? em : 59); min++) {
			var ovlcount = 1;
			var ovllist = [];
			Object.keys(stor).forEach(scc => { 
				if (cc != scc && scc != ignorecc) {
					for (let i = 0; i < stor[scc].ts.length; i++) {
						if (minCompareTS(tsls[0], hr, min, stor[scc].ts[i])) {
							ovlcount++;
							ovllist.push([scc, i]);
							if (!conflictStorage.includes(scc)) conflictStorage.push(scc);
						}
					}
				}
			});
			if (ovlcount > 1 && ovlcount >= maxwdd) {
				maxwdd = ovlcount;
				ovllist.forEach(param => {
					var ovlts = stor[param[0]].ts[param[1]].split(",");
					var tsord = parseInt(ovlts[5]);
					if (!takenup.includes(tsord) && parseInt(ovlts[4]) > 1) {
						takenup.push(tsord);
						// if (parseInt(ovlts[4]) > maxwdd) maxwdd = parseInt(ovlts[4]);
					}
					if (parseInt(ovlts[4]) < maxwdd) {
						writeWwd(param[0], param[1], maxwdd);
					}
				});
			}
		}
	}
	writeWwd(cc, tsi, maxwdd);
	// console.log(takenup);
	for (let wdd = maxwdd - 1; wdd >= 0; wdd--) {
		if (!takenup.includes(wdd)) {
			writeOrd(cc, tsi, wdd);
			break;
		}
	}
}

function minWiseComparison(cc, ts, tsi) {
	var tsls = ts.split(",");
	var stime = tsls[2];
	var etime = tsls[3];
	var curwdd = parseInt(tsls[4]);
	var curord = parseInt(tsls[5]);
	var sh = stime.split(":")[0];
	var sm = stime.split(":")[1];
	var eh = etime.split(":")[0];
	var em = etime.split(":")[1];
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	var maxwdd = 1;
	var takenup = [];
	for (let hr = sh; hr <= eh; hr++) {
		for (let min = (hr == sh ? sm : 0); min <= (hr == eh ? em : 59); min++) {
			var ovlcount = 1;
			var ovllist = [];
			Object.keys(stor).forEach(scc => { 
				if (cc != scc) {
					for (let i = 0; i < stor[scc].ts.length; i++) {
						if (minCompareTS(tsls[0], hr, min, stor[scc].ts[i])) {
							ovlcount++;
							ovllist.push([scc, i]);
							if (!conflictStorage.includes(scc)) conflictStorage.push(scc);
						}
					}
				}
			});
			if (ovlcount > 1 && ovlcount >= maxwdd) {
				maxwdd = ovlcount;
				ovllist.forEach(param => {
					var ovlts = stor[param[0]].ts[param[1]].split(",");
					var tsord = parseInt(ovlts[5]);
					if (!takenup.includes(tsord) && parseInt(ovlts[4]) > 1) {
						takenup.push(tsord);
						if (parseInt(ovlts[4]) > maxwdd) maxwdd = parseInt(ovlts[4]);
					}
					if (parseInt(ovlts[4]) < maxwdd) {
						writeWwd(param[0], param[1], maxwdd);
					}
				});
			}
		}
	}
	writeWwd(cc, tsi, maxwdd);
	// console.log(takenup);
	for (let wdd = maxwdd - 1; wdd >= 0; wdd--) {
		if (!takenup.includes(wdd)) {
			writeOrd(cc, tsi, wdd);
			break;
		}
	}
}

function writeWwd(cc, tsi, wwd) {
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	var lst = stor[cc].ts[tsi].split(",");
	stor[cc].ts[tsi] = lst[0] + "," + lst[1] + "," + lst[2] + "," + lst[3] + "," + wwd + "," + lst[5];
}

function writeOrd(cc, tsi, ord) {
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	var lst = stor[cc].ts[tsi].split(",");
	stor[cc].ts[tsi] = lst[0] + "," + lst[1] + "," + lst[2] + "," + lst[3] + "," + lst[4] + "," + ord;
}

function minCompareTS(day, hr, min, ts2) {
	var ts2ls = ts2.split(",");
	if (day != ts2ls[0]) return false; 
	var ts2stime = ts2ls[2];
	var ts2etime = ts2ls[3];
	var ts2sh = ts2stime.split(":")[0];
	var ts2sm = ts2stime.split(":")[1];
	var ts2eh = ts2etime.split(":")[0];
	var ts2em = ts2etime.split(":")[1];
	if (hr == ts2sh) return min > ts2sm;
	if (hr == ts2eh) return min < ts2em;
	if (hr > ts2sh && hr < ts2eh) return true;
	return false;
}

function compareTS(ts1, ts2) {
	var ts1ls = ts1.split(",");
	var ts2ls = ts2.split(",");
	if (ts1ls[0] != ts2ls[0]) return false;
	var ts1stime = ts1ls[2];
	var ts1etime = ts1ls[3];
	var ts2stime = ts2ls[2];
	var ts2etime = ts2ls[3];
	var ts1sh = ts1stime.split(":")[0];
	var ts1sm = ts1stime.split(":")[1];
	var ts1eh = ts1etime.split(":")[0];
	var ts1em = ts1etime.split(":")[1];
	var ts2sh = ts2stime.split(":")[0];
	var ts2sm = ts2stime.split(":")[1];
	var ts2eh = ts2etime.split(":")[0];
	var ts2em = ts2etime.split(":")[1];
	if (isBiggerTS(ts2sh, ts2sm, ts1sh, ts1sm) && isBiggerTS(ts1eh, ts1em, ts2sh, ts2sm)) return true;
	if (isBiggerTS(ts1sh, ts1sm, ts2sh, ts2sm) && isBiggerTS(ts2eh, ts2em, ts1sh, ts1sm)) return true;
	if (ts1sh == ts2sh && ts1sm == ts2sm) return true;
	return false;
}

function isBiggerTS(ts1h, ts1m, ts2h, ts2m) {
	if (ts1h > ts2h) {
		return true;
	} else if (ts1h < ts2h) {
		return false;
	} else {
		return ts1m > ts2m;
	}
}

function setMask() {
	$("#loading-mask").css("top", $("#sub-list").position().top).css("left", $("#sub-list").position().left).css("width", $("#sub-list").width()+10).css("height", $("#sub-list").height()+7);
}

function clearTemp() {
	temp = {};
	tempcc = "";
}

function subMouseIn(str, conf) {
	var prevpos = $("#cal-content-wrapper").scrollTop();
	$("#cal-content-wrapper").scrollTop(0);
	var cc = str.split("-")[0];
	var sub = str.split("-")[1];
	$(".cal-item.r"+cc).addClass("origin");
	$(".cal-item.addevent.origin.r"+cc).removeClass("origin");
	temp[sub].forEach(ts => {
		newSlot(cc, sub, ts, true, conf);
	});
	$("#cal-content-wrapper").scrollTop(prevpos);
}

function subMouseOut() {
	$(".temp").remove();
	$(".origin").removeClass("origin");
}

function subHoldAndCompare(cc) {
	tempcc = cc;
	var substr = "";
	var cnt = 0;
	$(".subs").each(function() {
		if (cnt > 0) substr += "-";
		substr += $(this).attr("id").split("-")[1];
		cnt++;
	});
	getTimeSlotsAndHold(cc, substr);
}

function render(recalc = false) {
	try {
		renderList();
		renderCal();
	} catch(error) {
		showDialog(errorStr(error));
		var stor = (sem == "sem1" ? sem1storage : sem2storage);
		localStorage.setItem(sem, "{}");
		stor = {};
	}
}

function deleteStorage(cc) {
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	delete stor[cc];
	resetConflict(cc);
	Object.keys(stor).forEach(scc => {
		if (stor[scc].aff == cc) {
			delete stor[scc];
			resetConflict(scc);
		}
	});
	localStorage.setItem(sem, JSON.stringify(stor));
	render();
}

function resetConflict(cc) {
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	if (conflictStorage.includes(cc)) {
		var prevConf = conflictStorage.map((x) => x);
		conflictStorage = [];
		prevConf.forEach(confcc => {
			if (confcc != cc) {
				for (let i = 0; i < stor[confcc].ts.length; i++) {
					recalcConflict(confcc, stor[confcc].ts[i], i);
				}
			}
		});
		localStorage.setItem("conf", JSON.stringify(conflictStorage));
	}
}

function newListItem(cc, title, sub) {
	str = '<div class="added-course-item unselectable r'+cc+'">' +
	'<div id="del-'+cc+'" class="kill-button selectable">' +
	'<p class="kill-text">X</p>' +
	'</div>' +
	'<p class="course-name bold-text course-p">'+cc+'<br>'+title+'</p>' +
	'<p class="course-sub course-p">Sub: '+sub+'</p>' +
	'</div>';
	return str;
}

function renderList() { 
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	$("#added-course-list").empty();
	Object.keys(stor).forEach(cc => { 
		if (!stor[cc].aff) $("#added-course-list").append(newListItem(cc, stor[cc].title, stor[cc].sub));
	});
	if (romode) $(".added-course-item").addClass("reverse");
}

function newSlotStr(cc, sub, timestr, ven, top, left, width, height, temp, conf) {
	str = '<div class="cal-item unselectable r'+cc+(temp ? " temp" : "")+(conf ? " conf" : "")+'" style="top: '+top+'px; left: '+left+
	'px; width: '+width+'px; height: '+height+'px;">' +
	'<p><span class="bold-text">'+cc+'-' + sub + '</span><br>' + timestr +
	'<br>' + (ven == "null" ? "TBA" : ven) + '</p></div>';
	return str;
}

function newSlotStrEvent(cc, affcc, ename, timestr, ven, top, left, width, height, conf) {
	var str;
	if (affcc == "_") {
		str = '<div class="cal-item unselectable i'+cc+ ' addevent' +(conf ? " conf" : "")+'" style="top: '+top+'px; left: '+left+
		'px; width: '+width+'px; height: '+height+'px;">' +
		'<p><span class="bold-text">'+ ename + '</span><br>' + timestr +
		'<br>' + ven + '</p></div>';
	} else {
		str = '<div class="cal-item unselectable r'+affcc+' i'+cc+' addevent' +(conf ? " conf" : "")+'" style="top: '+top+'px; left: '+left+
		'px; width: '+width+'px; height: '+height+'px;">' +
		'<p><span class="bold-text">'+ ename + '</span>&nbsp;<span>('+affcc+')</span><br>' + timestr +
		'<br>' + ven + '</p></div>';
	}
	return str;
}

function newSlotEvent(cc, ename, affcc, ts, conf=false) {
	var tslist = ts.split(",");
	var sleft = 0;
	if (tslist[0] == "") return;
	var width_div = tslist[4];
	var order = tslist[5];
	var unit_height = $("#d0").height() + 2;
	var swidth = ($("#d0").width() - 13 - (width_div - 1) * 4) / width_div - 12;
	if (width_div > 1) conf = true;
	sleft = $("#d"+tslist[0]).position().left + 6.5 + (swidth + 16) * order;
	var sven = tslist[1];
	var raw_start = tslist[2];
	var raw_end = tslist[3];
	var shr = raw_start.split(":")[0]
	var smin = raw_start.split(":")[1]
	var ehr = raw_end.split(":")[0]
	var emin = raw_end.split(":")[1]
	var stimestr = shr + ":" + smin + "-" + ehr + ":" + emin;
	var topvalue = (shr - 8) * 4 + (smin * 4 / 60);
	var tline = parseInt(topvalue);
	var stop = $(".t"+tline).eq(0).position().top;
	var delta = topvalue - tline;
	stop += delta * unit_height;
	var hrcross = ehr - shr;
	var sheight = (hrcross * 60 + parseInt(emin) - parseInt(smin)) * unit_height / 15 + hrcross;
	$("#cal-content-wrapper").append(newSlotStrEvent(cc, affcc, ename, stimestr, sven, stop, sleft, swidth, sheight, conf));
}

function newSlot(cc, sub, ts, temp=false, conf=false) {
	var tslist = ts.split(",");
	var sleft = 0;
	if (tslist[0] == "") return;
	var width_div = tslist[4];
	var order = tslist[5];
	var unit_height = $("#d0").height() + 2;
	var swidth = ($("#d0").width() - 13 - (width_div - 1) * 4) / width_div - 12;
	if (width_div > 1) conf = true;
	sleft = $("#d"+tslist[0]).position().left + 6.5 + (swidth + 16) * order;
	var sven = tslist[1];
	var raw_start = tslist[2];
	var raw_end = tslist[3];
	var shr = raw_start.split(":")[0]
	var smin = raw_start.split(":")[1]
	var ehr = raw_end.split(":")[0]
	var emin = raw_end.split(":")[1]
	var stimestr = shr + ":" + smin + "-" + ehr + ":" + emin;
	var tline = parseInt((shr - 8) * 4 + (smin * 4 / 60));
	var stop = $(".t"+tline).eq(0).position().top;
	var hrcross = ehr - shr;
	var sheight = (hrcross * 60 + parseInt(emin) - parseInt(smin)) * unit_height / 15 + hrcross;
	$("#cal-content-wrapper").append(newSlotStr(cc, sub, stimestr, sven, stop, sleft, swidth, sheight, temp, conf));
}

function renderCal() {
	var prevpos = $("#cal-content-wrapper").scrollTop();
	$("#cal-content-wrapper").scrollTop(0);
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	$(".cal-item").remove();
	Object.keys(stor).forEach(cc => { 
		if (!stor[cc].aff) {
			stor[cc].ts.forEach(tse => {
				newSlot(cc, stor[cc].sub, tse, false, conflictStorage.includes(cc));
			});
		} else {
			stor[cc].ts.forEach(tse => {
				newSlotEvent(cc, stor[cc].ename, stor[cc].aff, tse, conflictStorage.includes(cc) || conflictStorage.includes(stor[cc].aff));
			});
		}
	});
	$("#cal-content-wrapper").scrollTop(prevpos);
}

function checkSubSelected(cc) {
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	$(".subs").removeClass("selected");
		if (stor[cc] != undefined) {
		var sub = stor[cc].sub;
		$("li#"+cc+"-"+sub).addClass("selected");
	}
}

function aboutDialogStr() {
	return '<p class="bold-text">About Shipshape</p>' +
	'<p class="reg-text">An online course planner for planning your courses at HKU with ease. &#x1F4C5;</p>'+
	'<p>For version updates and bug fixes please check <a href="version">here</a>.<br>'+
	'For feedbacks please submit <a href="feedback">here</a> or <a href="mailto:thermitex@gmail.com">email to me</a>.<br>' +
	'Donate <a href="donate">here</a> to support further development and get more exciting features!</p>' +
	'<p>Thank you for using Shipshape!</p>';
}

function addDialogStr(update=false, affcc=undefined, day=undefined, shr=undefined, smin=undefined, ehr=undefined, emin=undefined, ename=undefined, venue=undefined, editcc=undefined) {
	var options = "";
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	Object.keys(stor).forEach(cc => {
		if (cc == affcc)
			options += '<option value="' + cc + '" selected>' + cc + '</option>';
		else
			if (!stor[cc].aff) options += '<option value="' + cc + '">' + cc + '</option>';
	});
	var shropts = "", sminopts = "", ehropts = "", eminopts = "";
	for (let i = 8; i <= 21; i++) {
		var hrval = "" + (i < 10 ? "0" + i : i);
		var shrselected = hrval == shr ? " selected" : "";
		var ehrselected = hrval == ehr ? " selected" : "";
		shropts += '<option value="' + hrval + '"' + shrselected + '>' + hrval + '</option>';
		ehropts += '<option value="' + hrval + '"' + ehrselected + '>' + hrval + '</option>';
	}
	for (let i = 0; i <= 59; i++) {
		var minval = "" + (i < 10 ? "0" + i : i);
		var sminselected = minval == smin ? " selected" : "";
		var eminselected = minval == emin ? " selected" : "";
		sminopts += '<option value="' + minval + '"' + sminselected + '>' + minval + '</option>';
		eminopts += '<option value="' + minval + '"' + eminselected + '>' + minval + '</option>';
	}
	return '<p class="bold-text">' + (update ? 'Edit' : 'Add') + ' Events</p>' +
	(update ? '' : '<p>You can add your own events to the calendar, like tutorials, discussions, labs, etc.</p>') +
	'<p><input id="event-name" placeholder="Event Name"' + (update ? ' value="'+ename+'"' : "") + '><br><input id="venue-name" placeholder="Venue (Optional)"' + (update ? ' value="'+venue+'"' : "") + '></p>' +
	'<p><label>Affiliate with: </label>' +
	'<select id="aff-course"><option value="_">None</option>' + options +
	'</select></p><p><label>From </label>' +
	'<select id="day-val">' +
	'<option value="0"' + (day == "0" ? " selected" : "") +'>Mon</option><option value="1"' + (day == "1" ? " selected" : "") +'>Tue</option><option value="2"' + (day == "2" ? " selected" : "") +'>Wed</option><option value="3"' + (day == "3" ? " selected" : "") +'>Thu</option><option value="4"' + (day == "4" ? " selected" : "") +'>Fri</option><option value="5"' + (day == "5" ? " selected" : "") +'>Sat</option><option value="6"' + (day == "6" ? " selected" : "") +'>Sun</option></select>&nbsp;&nbsp;-&nbsp;&nbsp;' +
	'<select id="shr-val">' + shropts + '</select>&nbsp;:&nbsp;' + 
	'<select id="smin-val">' + sminopts + '</select><br>' +
	'To&nbsp;&nbsp;&nbsp;<select id="ehr-val">' + ehropts + '</select>&nbsp;:&nbsp;' + 
	'<select id="emin-val">' + eminopts + '</select>' + '</p>' +
	'<p class="warning reg-text" id="add-warning">' +
	'<p><div id="confirm-add-button" class="dialog-button selectable' + (update ? ' '+editcc : '') + '">' + (update ? 'Update' : 'Add') + '</div></p>';
}

function addEvent(givencc=undefined) {
	if ($("#event-name").val() == "") {
		$("#add-warning").text("Please fill in the event name.");
		return;
	}
	if (parseInt($("#ehr-val").val()) < parseInt($("#shr-val").val()) || ($("#ehr-val").val() == $("#shr-val").val() && parseInt($("#emin-val").val()) < parseInt($("#smin-val").val()))) {
		$("#add-warning").text("End time cannot be earlier than start time.");
		return;
	}
	var cc = new Date().getTime().toString();
	if (givencc) {
		deleteStorage(givencc)
		cc = givencc;
	}
	var ts = $("#day-val").val() + "," + $("#venue-name").val() + "," + $("#shr-val").val() + ":" + $("#smin-val").val() + "," + $("#ehr-val").val() + ":" + $("#emin-val").val() + ",1,0";
	var obj = {"ename": $("#event-name").val(), "ts": [ts], "aff": $("#aff-course").val()};
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	if (stor[cc] == undefined) {
		stor[cc] = obj;
	} else {
		stor[cc].ename = $("#event-name").val();
		stor[cc].aff = $("#aff-course").val();
		stor[cc].ts = [ts];
	}
	var found = false;
	Object.keys(stor).forEach(scc => { 
		if (cc != scc && !found) {
			stor[scc].ts.forEach(stse => {
				if (compareTS(ts, stse)) {
					found = true;
				}
			});
		}
	});
	if (found) {
		if (!conflictStorage.includes(cc)) conflictStorage.push(cc);
		for (let i = 0; i < stor[cc].ts.length; i++) {
			minWiseComparison(cc, stor[cc].ts[i], i);
		}
	}
	localStorage.setItem(sem, JSON.stringify(stor));
	localStorage.setItem("conf", JSON.stringify(conflictStorage));
	render();
	closeDialog();
}

function showEditEvent(editcc) {
	var stor = (sem == "sem1" ? sem1storage : sem2storage);
	var paramList = stor[editcc].ts[0].split(",");
	showDialog(addDialogStr(true, stor[editcc].aff, paramList[0], paramList[2].split(":")[0], paramList[2].split(":")[1], paramList[3].split(":")[0], paramList[3].split(":")[1], stor[editcc].ename, paramList[1], editcc), -1, -1, 320);
}

function clearDialogStr() {
	return '<p class="bold-text">Clear Calendar</p>' +
	'<p class="warning reg-text">ALL stored data of both Sem1 and Sem2 will be wiped out. This action cannot be undone.</p>' +
	'<p>Are you sure you want to clear everything?</p>' +
	'<p><div id="confirm-clear-button" class="dialog-button selectable">Confirm</div></p>';
}

function exportDialogStr() {
	return '<p class="bold-text">Export Options</p>' +
	(romode ? '' : '<div>Export your schedule as &nbsp;&nbsp;<div id="export-cal" class="export-options export-option1 selected selectable">Calendar</div><div id="export-url" class="export-options export-option3 selectable">Link</div><div id="export-token" class="export-options export-option2 selectable">Token</div></div>') +
	'<p class="export-token">You can copy the current schedule to the Shipshape calendar on another device by importing the token below.</p>' +
	'<p class="export-cal">Export calendar of this semester to your favorite calendar app.</p>' +
	'<p class="export-cal"><label><input id="rpt" type="checkbox" value="">Repeat Weekly Until </label><input id="untildate" type="date" value=""></p>' +
	'<p class="export-url">You can share your current schedule to your friend or import to another device by visiting the link below.</p>' +
	'<p class="export-url"><form class="export-url" id="url-form"><label><input id="url-this-sem" type="radio" name="urlopt" checked="checked">This sem ('+sem+')</label>&nbsp;&nbsp;<label><input id="url-both-sem" type="radio" name="urlopt">Both sems</label></form></p>' +
	'<p class="export-token"><form class="export-token" id="token-form"><label><input id="token-this-sem" type="radio" name="tokenopt" checked="checked">This sem ('+sem+')</label>&nbsp;&nbsp;<label><input id="token-both-sem" type="radio" name="tokenopt">Both sems</label></form></p>' +
	'<p class="export-token"><textarea id="token-text"></textarea></p>' +
	'<p class="export-token"><div id="token-copy-button" class="export-token dialog-button selectable">Copy to Clipboard</div></p>' +
	'<p class="export-url"><textarea id="url-text">Link Not Generated</textarea></p>' +
	'<p class="warning reg-text export-url" id="url-warning"></p>' +
	'<p class="export-url"><div id="url-gen-button" class="export-url dialog-button selectable">Generate Link</div><div id="url-copy-button" class="export-url dialog-button selectable nonemp">Copy to Clipboard</div></p>' +
	'<p class="export-cal"><div id="export-cal-btn" class="export-cal dialog-button selectable">Export as iCal</div></p>';
}

function importDialogStr() {
	return '<p class="bold-text">Import</p>' +
	'<p><span class="reg-text">Paste your token here:</span><br>Please note that some of the courses may be replaced (Tokens can be generated from export -> token)</p>' +
	'<p><textarea id="import-text"></textarea></p>' +
	'<p class="warning reg-text" id="import-warning"></p>' +
	'<p><div id="token-import-button" class="dialog-button selectable">Import</div></p>';
}

function errorStr(err) {
	return '<p class="bold-text">Oops...</p>' +
	'<p>Sorry! Something went wrong. The erroneous data has been reset. The developer has been informed of the following error:</p>' +
	'<p class="warning reg-text">' + err + '</p>' +
	'<p><div id="err-okay-button" class="dialog-button selectable">Dismiss</div></p>';
}

function showDialog(content, left=-1, top=-1, width=-1) {
	$("#dialog-content").html(content);
	$("#dialog").css("left", "50%");
	$("#dialog").css("top", "50%");
	$("#dialog").css("transform", "translate(-50%, -50%)");
	if (left >= 0) $("#dialog").css("left", left);
	if (top >= 0) $("#dialog").css("top", top);
	if (width >= 0) $("#dialog").css("width", width);
	if (left >= 0 || top >= 0) $("#dialog").css("transform", "none");
	$("#dialog-mask").fadeIn("fast");
	$("#dialog").fadeIn("fast");
}

function closeDialog() {
	$("#dialog-mask").fadeOut();
	$("#dialog").fadeOut("fast", function() {
		$("#dialog-content").html("");
	});
}

function generateToken(both=true) {
	if (both) {
		var data = lzw_encode(JSON.stringify({"a": sem1storage, "b": sem2storage, "c": conflictStorage}));
		var checksum = CryptoJS.MD5(data).toString();
		var body = CryptoJS.AES.encrypt(data, checksum);
		var token = checksum + "-dt-" + body;
		return token;
	} else {
		if (sem == "sem1") {
			var data = lzw_encode(JSON.stringify({"a": sem1storage, "c": conflictStorage}));
			var checksum = CryptoJS.MD5(data).toString();
			var body = CryptoJS.AES.encrypt(data, checksum);
			var token = checksum + "-dt-" + body;
			return token;
		} else {
			var data = lzw_encode(JSON.stringify({"b": sem2storage, "c": conflictStorage}));
			var checksum = CryptoJS.MD5(data).toString();
			var body = CryptoJS.AES.encrypt(data, checksum);
			var token = checksum + "-dt-" + body;
			return token;
		}
	}
}

function solveToken(data) {
	try {
		var doc = data.split("-dt-");
		var checksum = doc[0];
		var body = doc[1];
		if (body == undefined) return undefined;
		var solved_body = CryptoJS.AES.decrypt(body, checksum).toString(CryptoJS.enc.Utf8);
		if (checksum == CryptoJS.MD5(solved_body).toString()) {
			return JSON.parse(lzw_decode(solved_body));
		} else {
			return undefined;
		}
	} catch(e) {
		console.log(e);
		return undefined;
	}
}

function buildURL(token) {
	var expdate = new Date();
	expdate.setDate(now.getDate() + 3);
	var mili = new Date().getTime();
	var id = urlid + mili;
	// $.post("http://101.133.213.242/bk/urlstorage.jsp", {"mode": "w", "id": id, "data": token, "expdate": makeStandardDate(expdate), "curdate": makeStandardDate(now)}, function(data, status) {
	// 	if (status == "success") {
	// 		$("#url-text").val("http://shipshape.top/?t=" + id);
	// 		$("#url-gen-button").addClass("unselectable").text("Generated");
	// 	}
	// });
}

function importSolved(res) {
	if (res.a) {
		localStorage.setItem("sem1", JSON.stringify(res.a));
		sem1storage = res.a;
	}
	if (res.b) {
		localStorage.setItem("sem2", JSON.stringify(res.b));
		sem2storage = res.b;
	}
	localStorage.setItem("conf", JSON.stringify(res.c));
	conflictStorage = res.c;
	closeDialog();
	render();
}

// LZW-compress a string
function lzw_encode(s) {
	var dict = {};
	var data = (s + "").split("");
	var out = [];
	var currChar;
	var phrase = data[0];
	var code = 256;
	for (var i=1; i<data.length; i++) {
		currChar=data[i];
		if (dict[phrase + currChar] != null) {
			phrase += currChar;
		}
		else {
			out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
			dict[phrase + currChar] = code;
			code++;
			phrase=currChar;
		}
	}
	out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
	for (var i=0; i<out.length; i++) {
		out[i] = String.fromCharCode(out[i]);
	}
	return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
	var dict = {};
	var data = (s + "").split("");
	var currChar = data[0];
	var oldPhrase = currChar;
	var out = [currChar];
	var code = 256;
	var phrase;
	for (var i=1; i<data.length; i++) {
		var currCode = data[i].charCodeAt(0);
		if (currCode < 256) {
			phrase = data[i];
		}
		else {
		   phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
		}
		out.push(phrase);
		currChar = phrase.charAt(0);
		dict[code] = oldPhrase + currChar;
		code++;
		oldPhrase = phrase;
	}
	return out.join("");
}

function makeStandardDate(date) {
	return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}