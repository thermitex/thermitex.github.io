$(document).ready(function () {
	$("button").click(function () {
		var cal = getCal($("#enrolinfo").val());
		cal.download(genFileName());
	});
});

function genFileName() {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var date = now.getDate();
	var hour = now.getHours();
	var min = now.getMinutes();
	var sec = now.getSeconds();
	return "export-" + year + month + date + hour + min + sec;
}

function getCal(enrolinfo) {
	var cal = ics("weekly.cal.hku.hk", "thermitex");
	var entries = enrolinfo.split("\n");
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		var fields = entry.split("\t");
		if (fields.length != 7) {
			alert("Corrupted Input!");
			return;
		}
		if (fields[4] == "Approved") {
			var courseName = fields[2].slice(0, 12);
			var loc = "MB141";
			var dtstart = "2/5/2020 10:00 am";
			var dtend = "2/5/2020 11:00 am";
			cal.addEvent(courseName, "", loc, dtstart, dtend);
			cal.addEvent("Test", "", loc, "2/6/2020 11:00 am", "2/6/2020 2:00 pm");
		}
	}
	return cal;
}

var ics = function(uidDomain, prodId) {
	'use strict';

	if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') == -1) {
		console.log('Unsupported Browser');
		return;
	}

	if (typeof uidDomain === 'undefined') { uidDomain = 'default'; }
	if (typeof prodId === 'undefined') { prodId = 'Calendar'; }

	var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';
	var calendarEvents = [];
	var calendarStart = [
		'BEGIN:VCALENDAR',
		'PRODID:' + prodId,
		'VERSION:2.0',
		'X-WR-CALNAME:HKU Weekly Schedule'
	].join(SEPARATOR);
	var calendarEnd = SEPARATOR + 'END:VCALENDAR';
	var BYDAY_VALUES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

	return {
		/**
		 * Returns events array
		 * @return {array} Events
		 */
		'events': function() {
			return calendarEvents;
		},

		/**
		 * Returns calendar
		 * @return {string} Calendar in iCalendar format
		 */
		'calendar': function() {
			return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
		},

		/**
		 * Add event to the calendar
		 * @param  {string} subject     Subject/Title of event
		 * @param  {string} description Description of event
		 * @param  {string} location    Location of event
		 * @param  {string} begin       Beginning date of event
		 * @param  {string} stop        Ending date of event
		 */
		'addEvent': function(subject, description, location, begin, stop, rrule) {
			// I'm not in the mood to make these optional... So they are all required
			if (typeof subject === 'undefined' ||
				typeof description === 'undefined' ||
				typeof location === 'undefined' ||
				typeof begin === 'undefined' ||
				typeof stop === 'undefined'
			) {
				return false;
			}

			// validate rrule
			if (rrule) {
				if (!rrule.rrule) {
					if (rrule.freq !== 'YEARLY' && rrule.freq !== 'MONTHLY' && rrule.freq !== 'WEEKLY' && rrule.freq !== 'DAILY') {
						throw "Recurrence rrule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";
					}

					if (rrule.until) {
						if (isNaN(Date.parse(rrule.until))) {
							throw "Recurrence rrule 'until' must be a valid date string";
						}
					}

					if (rrule.interval) {
						if (isNaN(parseInt(rrule.interval))) {
							throw "Recurrence rrule 'interval' must be an integer";
						}
					}

					if (rrule.count) {
						if (isNaN(parseInt(rrule.count))) {
							throw "Recurrence rrule 'count' must be an integer";
						}
					}

					if (typeof rrule.byday !== 'undefined') {
						if ((Object.prototype.toString.call(rrule.byday) !== '[object Array]')) {
							throw "Recurrence rrule 'byday' must be an array";
						}

						if (rrule.byday.length > 7) {
							throw "Recurrence rrule 'byday' array must not be longer than the 7 days in a week";
						}

						// Filter any possible repeats
						rrule.byday = rrule.byday.filter(function(elem, pos) {
							return rrule.byday.indexOf(elem) == pos;
						});

						for (var d in rrule.byday) {
							if (BYDAY_VALUES.indexOf(rrule.byday[d]) < 0) {
								throw "Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'";
							}
						}
					}
				}
			}

			var start_date = new Date(begin);
			var end_date = new Date(stop);
			var now_date = new Date();

			var start_year = ("0000" + (start_date.getFullYear().toString())).slice(-4);
			var start_month = ("00" + ((start_date.getMonth() + 1).toString())).slice(-2);
			var start_day = ("00" + ((start_date.getDate()).toString())).slice(-2);
			var start_hours = ("00" + (start_date.getHours().toString())).slice(-2);
			var start_minutes = ("00" + (start_date.getMinutes().toString())).slice(-2);
			var start_seconds = ("00" + (start_date.getSeconds().toString())).slice(-2);

			var end_year = ("0000" + (end_date.getFullYear().toString())).slice(-4);
			var end_month = ("00" + ((end_date.getMonth() + 1).toString())).slice(-2);
			var end_day = ("00" + ((end_date.getDate()).toString())).slice(-2);
			var end_hours = ("00" + (end_date.getHours().toString())).slice(-2);
			var end_minutes = ("00" + (end_date.getMinutes().toString())).slice(-2);
			var end_seconds = ("00" + (end_date.getSeconds().toString())).slice(-2);

			var now_year = ("0000" + (now_date.getFullYear().toString())).slice(-4);
			var now_month = ("00" + ((now_date.getMonth() + 1).toString())).slice(-2);
			var now_day = ("00" + ((now_date.getDate()).toString())).slice(-2);
			var now_hours = ("00" + (now_date.getHours().toString())).slice(-2);
			var now_minutes = ("00" + (now_date.getMinutes().toString())).slice(-2);
			var now_seconds = ("00" + (now_date.getSeconds().toString())).slice(-2);

			// Since some calendars don't add 0 second events, we need to remove time if there is none...
			var start_time = '';
			var end_time = '';
			if (start_hours + start_minutes + start_seconds + end_hours + end_minutes + end_seconds != 0) {
				start_time = 'T' + start_hours + start_minutes + start_seconds;
				end_time = 'T' + end_hours + end_minutes + end_seconds;
			}
			var now_time = 'T' + now_hours + now_minutes + now_seconds;

			var start = start_year + start_month + start_day + start_time;
			var end = end_year + end_month + end_day + end_time;
			var now = now_year + now_month + now_day + now_time;

			// recurrence rrule vars
			var rruleString;
			if (rrule) {
				if (rrule.rrule) {
					rruleString = rrule.rrule;
				} else {
					rruleString = 'rrule:FREQ=' + rrule.freq;

					if (rrule.until) {
						var uDate = new Date(Date.parse(rrule.until)).toISOString();
						rruleString += ';UNTIL=' + uDate.substring(0, uDate.length - 13).replace(/[-]/g, '') + '000000Z';
					}

					if (rrule.interval) {
						rruleString += ';INTERVAL=' + rrule.interval;
					}

					if (rrule.count) {
						rruleString += ';COUNT=' + rrule.count;
					}

					if (rrule.byday && rrule.byday.length > 0) {
						rruleString += ';BYDAY=' + rrule.byday.join(',');
					}
				}
			}

			var stamp = new Date().toISOString();

			var calendarEvent = [
				'BEGIN:VEVENT',
				'UID:' + new Date().getTime() + calendarEvents.length + "@" + uidDomain,
				'CLASS:PUBLIC',
				'DESCRIPTION:' + description,
				'DTSTAMP;VALUE=DATE-TIME:' + now,
				'DTSTART;TZID=Asia/Hong_Kong:' + start,
				'DTEND;TZID=Asia/Hong_Kong:' + end,
				'LOCATION:' + location,
				'SUMMARY;LANGUAGE=en-us:' + subject,
				'TRANSP:TRANSPARENT',
				'SEQUENCE:0'
				'END:VEVENT'
			];

			if (rruleString) {
				calendarEvent.splice(4, 0, rruleString);
			}

			calendarEvent = calendarEvent.join(SEPARATOR);

			calendarEvents.push(calendarEvent);
			return calendarEvent;
		},

		/**
		 * Download calendar using the saveAs function from filesave.js
		 * @param  {string} filename Filename
		 * @param  {string} ext      Extention
		 */
		'download': function(filename, ext) {
			if (calendarEvents.length < 1) {
				return false;
			}

			ext = (typeof ext !== 'undefined') ? ext : '.ics';
			filename = (typeof filename !== 'undefined') ? filename : 'calendar';
			var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

			var blob;
			if (navigator.userAgent.indexOf('MSIE 10') === -1) { // chrome or firefox
				blob = new Blob([calendar]);
			} else { // ie
				var bb = new BlobBuilder();
				bb.append(calendar);
				blob = bb.getBlob('text/calendar;charset=' + document.characterSet);
			}
			saveAs(blob, filename + ext);
			return calendar;
		},

		/**
		 * Build and return the ical contents
		 */
		'build': function() {
			if (calendarEvents.length < 1) {
				return false;
			}

			var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

			return calendar;
		}
	};
};

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *  See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		 doc = view.document
		 // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				 filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}
			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}
	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;
	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;
	return saveAs;
}(
		typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window
if (typeof module !== "undefined" && module.exports) {
 module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
 define("FileSaver.js", function() {
	return saveAs;
 });
}