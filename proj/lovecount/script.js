function getDaysBetween(dateString1,dateString2){
	var startDate = Date.parse(dateString1);
	var endDate = Date.parse(dateString2);
	var days =(endDate - startDate)/(1*24*60*60*1000);
	// alert(days);
	return  days;
}

window.onload=function(){
	document.getElementById("count").innerText = getDaysBetween("28 Aug 2017", new Date());
}