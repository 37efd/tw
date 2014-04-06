alert('SceneSceneChannel.js loaded');

SceneSceneChannel.Player = null;

SceneSceneChannel.STATE_LOADING_TOKEN = 0;
SceneSceneChannel.STATE_LOADING_PLAYLIST = 1;
SceneSceneChannel.STATE_PLAYING = 2;

SceneSceneChannel.loadingState;
SceneSceneChannel.loadingDataTryMax = 15;
SceneSceneChannel.loadingDataTry;
SceneSceneChannel.loadingDataTimeout;
SceneSceneChannel.responseToken;

function sleep(millis, callback) {
    setTimeout(function()
            { callback(); }
    , millis);
}


function SceneSceneChannel() {

};

SceneSceneChannel.shutdownStream = function()
{
	SceneSceneChannel.Player.Stop();
	
	sf.scene.show('SceneBrowser');
	sf.scene.hide('SceneChannel');
	sf.scene.focus('SceneBrowser');
};


SceneSceneChannel.prototype.initialize = function ()
{	
	SceneSceneChannel.Player = document.getElementById('pluginObjectPlayer');
};

SceneSceneChannel.prototype.handleShow = function (data) {
	alert("SceneSceneChannel.handleShow()");
};

SceneSceneChannel.prototype.handleHide = function () {
	alert("SceneSceneChannel.handleHide()");
};

SceneSceneChannel.prototype.handleFocus = function () {
	alert("SceneSceneChannel.handleFocus()");

    SceneSceneChannel.Player.OnConnectionFailed = 'SceneSceneChannel.onConnectionFailed';
    SceneSceneChannel.Player.OnAuthenticationFailed = 'SceneSceneChannel.onAuthenticationFailed';
    SceneSceneChannel.Player.OnStreamNotFound = 'SceneSceneChannel.onStreamNotFound';
    SceneSceneChannel.Player.OnNetworkDisconnected = 'SceneSceneChannel.onNetworkDisconnected';
    SceneSceneChannel.Player.OnRenderError = 'SceneSceneChannel.onRenderError';
    SceneSceneChannel.Player.OnRenderingComplete = 'SceneSceneChannel.onRenderingComplete';
    SceneSceneChannel.Player.OnBufferingComplete = 'SceneSceneChannel.onBufferingComplete';
    SceneSceneChannel.Player.OnBufferingStart = 'SceneSceneChannel.onBufferingStart';
    SceneSceneChannel.Player.OnBufferingProgress = 'SceneSceneChannel.onBufferingProgress';
    
    SceneSceneChannel.Player.SetDisplayArea(0, 0, 1280, 720);
    
    SceneSceneChannel.loadingState = SceneSceneChannel.STATE_LOADING_TOKEN;
    SceneSceneChannel.loadData();
};

SceneSceneChannel.prototype.handleBlur = function () {
	alert("SceneSceneChannel.handleBlur()");
};

SceneSceneChannel.prototype.handleKeyDown = function (keyCode) {
	alert("SceneSceneChannel.handleKeyDown(" + keyCode + ")");

	switch (keyCode) {
		case sf.key.LEFT:
			break;
		case sf.key.RIGHT:
			break;
		case sf.key.UP:
			break;
		case sf.key.DOWN:
			break;
		case sf.key.ENTER:
			break;
		case sf.key.RETURN:
			sf.key.preventDefault();
			SceneSceneChannel.shutdownStream();
			break;
		case sf.key.VOL_UP:
			sf.service.setVolumeControl(true);
			break;
		case sf.key.VOL_DOWN:
			sf.service.setVolumeControl(true);
			break;
		case sf.key.MUTE:
			sf.service.setVolumeControl(true);
			break;
		default:
			alert("handle default key event, key code(" + keyCode + ")");
			break;
	}
};


SceneSceneChannel.onConnectionFailed = function () {
	SceneSceneChannel.showDialog("Connection failed.");
	sleep(3000, SceneSceneChannel.shutdownStream);
};

SceneSceneChannel.onAuthenticationFailed = function () {
	SceneSceneChannel.showDialog("Authentication failed.");
	sleep(3000, SceneSceneChannel.shutdownStream);
};

SceneSceneChannel.onStreamNotFound = function () {
	SceneSceneChannel.showDialog("Stream not found.");
	sleep(3000, SceneSceneChannel.shutdownStream);
};

SceneSceneChannel.onNetworkDisconnected = function () {
	SceneSceneChannel.showDialog("Network disconnected.");
	sleep(3000, SceneSceneChannel.shutdownStream);
};

SceneSceneChannel.onRenderError = function (RenderErrorType) {
	SceneSceneChannel.showDialog("Render error.");
	sleep(3000, SceneSceneChannel.shutdownStream);
};

SceneSceneChannel.onRenderingComplete = function () {
	SceneSceneChannel.shutdownStream();
};

SceneSceneChannel.onBufferingStart = function () {
	SceneSceneChannel.showDialog("Buffering");
};

SceneSceneChannel.onBufferingProgress = function (percent) {
	SceneSceneChannel.showDialog("Buffering: " + percent + "%");
};

SceneSceneChannel.onBufferingComplete = function () {
	SceneSceneChannel.showPlayer();
};



SceneSceneChannel.showDialog = function(title)
{
	$("#scene_channel_dialog_loading_text").text(title);
	$("#scene_channel_dialog_loading").show();
};

SceneSceneChannel.showPlayer = function()
{
	$("#scene_channel_dialog_loading").hide();
};

SceneSceneChannel.loadDataError = function()
{
	SceneSceneChannel.loadingDataTry++;
	if (SceneSceneChannel.loadingDataTry < SceneSceneChannel.loadingDataTryMax)
	{
		if (SceneSceneChannel.loadingDataTry < 10)
		{
			SceneSceneChannel.loadingDataTimeout += 100;
		}
		else
		{
			switch (SceneSceneChannel.loadingDataTry)
			{
			case 10:
				SceneSceneChannel.loadingDataTimeout = 5000;
				break;
			case 11:
				SceneSceneChannel.loadingDataTimeout = 10000;
				break;
			case 12:
				SceneSceneChannel.loadingDataTimeout = 30000;
				break;
			case 13:
				SceneSceneChannel.loadingDataTimeout = 60000;
				break;
			default:
				SceneSceneChannel.loadingDataTimeout = 300000;
				break;
			}
		}
		SceneSceneChannel.loadDataRequest();
	}
	else
	{
		SceneSceneChannel.showDialog("Error: Unable to retrieve access token.");
		sleep(3000, SceneSceneChannel.shutdownStream);
	}
};

SceneSceneChannel.loadDataSuccess = function(aresponse)
{
	if (SceneSceneChannel.loadingState == SceneSceneChannel.STATE_LOADING_TOKEN)
	{
		SceneSceneChannel.responseToken = JSON.parse(aresponse);
		SceneSceneChannel.loadingState = SceneSceneChannel.STATE_LOADING_PLAYLIST;
		SceneSceneChannel.loadData();
	}
	else
	{
		var url = window.URL.createObjectURL(aresponse);
		SceneSceneChannel.Player.Play(url + '|COMPONENT=HLS'); 
		SceneSceneChannel.showDialog("Opening"); 
	}
};

SceneSceneChannel.loadDataRequest = function()
{
	try
	{
		var dialog_title = "";
		if (SceneSceneChannel.loadingDataTry > 0)
		{
			if (SceneSceneChannel.loadingState == SceneSceneChannel.STATE_LOADING_TOKEN)
			{
				dialog_title = "Requesting token";
			}
			else
			{
				dialog_title = "Requesting playlist";
			}
			dialog_title += ". Retrying (" + (SceneSceneChannel.loadingDataTry + 1) + "/" + SceneSceneChannel.loadingDataTryMax + ")";
		}
		SceneSceneChannel.showDialog(dialog_title);
		
		var xmlHttp = new XMLHttpRequest();
		var theUrl;
		if (SceneSceneChannel.loadingState == SceneSceneChannel.STATE_LOADING_TOKEN)
		{
			theUrl = 'http://api.twitch.tv/api/channels/' + SceneSceneBrowser.selectedChannel + '/access_token';
		}
		else
		{
			theUrl = 'http://usher.twitch.tv/select/' + SceneSceneBrowser.selectedChannel
				+ '.json?type=any&nauthsig=' + SceneSceneChannel.responseToken.sig
				+ '&nauth=' + escape(SceneSceneChannel.responseToken.token);
		}
		
		xmlHttp.ontimeout = function()
		{
			SceneSceneChannel.loadDataError();
		};
		xmlHttp.onload = function()
		{
			if (xmlHttp.readyState === 4)
			{ 
				if (xmlHttp.status === 200)
				{
					try
					{
						if (SceneSceneChannel.loadingState == SceneSceneChannel.STATE_LOADING_TOKEN)
						{
							SceneSceneChannel.loadDataSuccess(xmlHttp.response, xmlHttp.responseText);
						}
						else
						{
							SceneSceneChannel.loadDataSuccess(xmlHttp.response, xmlHttp.response);
						}
					}
					catch (err)
					{
						SceneSceneChannel.showDialog("loadDataSuccess() exception: " + err.name + ' ' + err.message);
					}
					
				}
				else
				{
					SceneSceneChannel.loadDataError();
				}
			}
		};
	    xmlHttp.open("GET", theUrl, true);
	    if (SceneSceneChannel.loadingState == SceneSceneChannel.STATE_LOADING_PLAYLIST)
		{
			xmlHttp.responseType = "blob";
		}
		xmlHttp.timeout = SceneSceneChannel.loadingDataTimeout;
	    xmlHttp.send(null);
	}
	catch (error)
	{
		SceneSceneChannel.loadDataError();
	}
};

SceneSceneChannel.loadData = function()
{	
	SceneSceneChannel.loadingDataTry = 0;
	SceneSceneChannel.loadingDataTimeout = 500;
	
	SceneSceneChannel.loadDataRequest();
};
