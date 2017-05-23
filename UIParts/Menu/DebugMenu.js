function DebugMenu(button){
	Menu.call(this,button,false,130);
	this.addOption("Hide Debug", TitleBar.hideDebug);
	this.addOption("Version", this.optionVersion);
	this.addOption("Set JS Url", this.optionSetJsUrl);
	this.addOption("Reset JS Url", this.optionResetJsUrl);
	this.addOption("Send request", this.optionSendRequest);
	this.addOption("Log HTTP", this.optionLogHttp);
	this.addOption("HB names", this.optionHBs);
	this.addOption("Allow virtual HBs", this.optionVirtualHBs);
	this.addOption("Clear log", this.optionClearLog);
	this.addOption("Connect Multiple", HummingbirdManager.showConnectMultipleDialog);
	this.addOption("HB Debug info", HummingbirdManager.displayDebugInfo);
	this.addOption("Recount HBs", HummingbirdManager.recountAndDisplayHBs);
	this.addOption("iOS HBs", HummingbirdManager.displayiOSHBNames);
	this.buildMenu();
	this.lastRequest = "";
	this.lastResponse = "";
}
DebugMenu.prototype = Object.create(Menu.prototype);
DebugMenu.prototype.constructor = DebugMenu;
DebugMenu.prototype.optionNew=function(){
	SaveManager.new();
};
DebugMenu.prototype.optionVersion=function(){
	GuiElements.alert("Version: "+GuiElements.appVersion);
};
DebugMenu.prototype.optionScreenSize=function(){
	HtmlServer.sendRequestWithCallback("tablet/screenSize",function(response){
		GuiElements.alert("Size: "+response);
	});
};
DebugMenu.prototype.optionPixelSize=function(){
	GuiElements.alert(GuiElements.height+" "+GuiElements.width);
};
DebugMenu.prototype.optionZoom=function(){
	HtmlServer.getSetting("zoom",function(response){
		GuiElements.alert("Zoom: "+(response));
	});
};
DebugMenu.prototype.optionHBs=function(){
	HtmlServer.sendRequestWithCallback("hummingbird/names",function(response){
		GuiElements.alert("Names: "+response.split("\n").join(","));
	});
};
DebugMenu.prototype.optionLogHttp=function(){
	HtmlServer.logHttp=true;
};
DebugMenu.prototype.optionVirtualHBs=function(){
	HummingbirdManager.allowVirtualHBs=true;
};
DebugMenu.prototype.optionClearLog=function(){
	GuiElements.alert("");
};
DebugMenu.prototype.optionSetJsUrl=function(){
	HtmlServer.showDialog("Set JS URL", "https://www.example.com/", this.lastRequest, function(cancel, url) {
		if(!cancel && url != ""){
			var request = "setjsurl/" + HtmlServer.encodeHtml(url);
			HtmlServer.sendRequestWithCallback(request);
		}
	}, function(){});
};
DebugMenu.prototype.optionResetJsUrl=function(){
	var request = "resetjsurl";
	HtmlServer.sendRequestWithCallback(request);
};
DebugMenu.prototype.optionSendRequest=function(){
	var message = this.lastResponse;
	if(this.lastResponse == ""){
		message = "Request: http://localhost:22179/[...]"
	}
	var me = this;
	HtmlServer.showDialog("Send request", message, this.lastRequest, function(cancel, request) {
		if(!cancel && (request != "" || me.lastRequest != "")){
			if(request == ""){
				request = me.lastRequest;
			}
			me.lastRequest = request;
			HtmlServer.sendRequestWithCallback(request, function(resp){
				me.lastResponse = "Response: \"" + resp + "\"";
				me.optionSendRequest();
			}, function(){
				me.lastResponse = "Error sending request";
				me.optionSendRequest();
			});
		}
		else{
			me.lastResponse = "";
		}
	}, function(){
		me.lastResponse = "";
	});
};