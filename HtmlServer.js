/* HtmlServer is a static class that will manage HTTP requests.
 * This class is not nearly finished.
 */
function HtmlServer(){
	HtmlServer.port=22179;
}
HtmlServer.encodeHtml=function(message){
	var eVal;
	if (!encodeURIComponent) {
		eVal = escape(message);
		eVal = eVal.replace(/@/g, "%40");
		eVal = eVal.replace(/\//g, "%2F");
		eVal = eVal.replace(/\+/g, "%2B");
		eVal = eVal.replace(/'/g, "%60");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	} else {
		eVal = encodeURIComponent(message);
		eVal = eVal.replace(/~/g, "%7E");
		eVal = eVal.replace(/!/g, "%21");
		eVal = eVal.replace(/\(/g, "%28");
		eVal = eVal.replace(/\)/g, "%29");
		eVal = eVal.replace(/'/g, "%27");
		eVal = eVal.replace(/"/g, "%22");
		eVal = eVal.replace(/`/g, "%27");
		eVal = eVal.replace(/&/g, "%26");
	}
	return eVal; //.replace(/\%20/g, "+");
}
HtmlServer.sendRequestWithCallback=function(request,callbackFn,callbackErr){
	try {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					if(callbackFn!=null){
						callbackFn(xhttp.responseText);
					}
				}
				else {
					if(callbackErr!=null){
						callbackErr();
					}
				}
			}
		};
		xhttp.open("GET", HtmlServer.getUrlForRequest(request), true); //Get the names
		GuiElements.alert(HtmlServer.getUrlForRequest(request));
		xhttp.send(); //Make the request
	}
	catch(err){
		if(callbackErr!=null){
			callbackErr();
		}
	}
}
HtmlServer.sendHBRequest=function(request,requestStatus){
	HtmlServer.sendRequest(HtmlServer.getHBRequest(request),requestStatus);
}
HtmlServer.sendRequest=function(request,requestStatus){
	if(requestStatus!=null){
		requestStatus.error=false;
		var callbackFn=function(response){
			callbackFn.requestStatus.finished=true;
			callbackFn.requestStatus.result=response;
		}
		callbackFn.requestStatus=requestStatus;
		var callbackErr=function(){
			callbackErr.requestStatus.finished=true;
			callbackErr.requestStatus.error=true;
		}
		callbackErr.requestStatus=requestStatus;
		HtmlServer.sendRequestWithCallback(request,callbackFn,callbackErr);
	}
	else{
		HtmlServer.sendRequestWithCallback(request);
	}
}
HtmlServer.getHBRequest=function(request){
	return "hummingbird/"+HtmlServer.encodeHtml(HummingbirdManager.hBNames)+"/"+request;
}
HtmlServer.getUrlForRequest=function(request){
	return "http://localhost:"+HtmlServer.port+"/"+request;
}
HtmlServer.showDialog=function(title,question,hint,callbackFn,callbackErr){
	var HS=HtmlServer;
	var request = "iPad/dialog/"+HS.encodeHtml(title);
	request+="/"+HS.encodeHtml(question);
	var onDialogPresented=function(result){
		HS.getDialogResponse(onDialogPresented.callbackFn,onDialogPresented.callbackErr);
	}
	onDialogPresented.callbackFn=callbackFn;
	onDialogPresented.callbackErr=callbackErr;
	HS.sendRequestWithCallback(request,onDialogPresented,callbackErr);
}
HtmlServer.getDialogResponse=function(callbackFn,callbackErr){
	var HS=HtmlServer;
	var request = "iPad/dialog_response";
	var onResponseReceived=function(response){
		if(response=="No Response"){
			HtmlServer.getDialogResponse(onResponseReceived.callbackFn,onResponseReceived.callbackErr);
		}
		else if(response=="Cancelled"){
			onResponseReceived.callbackFn(true);
		}
		else{
			var trimmed=response.substring(1,response.length-1);
			onResponseReceived.callbackFn(false,trimmed);
		}
	}
	onResponseReceived.callbackFn=callbackFn;
	onResponseReceived.callbackErr=callbackErr;
	HS.sendRequestWithCallback(request,onResponseReceived,callbackErr);
}