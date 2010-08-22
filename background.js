/*
Closes all currently open options pages for NotScripts and then opens a fresh tab with it loaded.
*/
function showOptionsPage()
{
	chrome.windows.getAll({populate: true}, function(windowsArray) {
		var optionsPageURL = chrome.extension.getURL("options.html");
		for (var i = 0; i < windowsArray.length; i++)
		{
			var currWindow = windowsArray[i];
			for (var j = 0; j < currWindow.tabs.length; j++)
			{				
				if (currWindow.tabs[j].url == optionsPageURL)
					chrome.tabs.remove(currWindow.tabs[j].id);
			}		
		}
		chrome.tabs.create({"url": optionsPageURL});
	});	
}

/*
Generates a json object with all the applicable settings for a website of "url".
*/
function generateAllSettings(url, topWindowUrl)
{
	return {"tempVals": {"globalAllowAll": sessionConfig.get("globalAllowAll"), "tempAllowList": tempAllowList},
			"whitelist": whitelist,
			"reload": config.get('reloadCurrentTabOnToggle')};			
}

/*
Listens for messages from our content scripts to provide settings information.
*/
chrome.extension.onRequest.addListener(function(msg, src, send) {
	if (msg.type === "get settings block start")
	{	
		//console.log("get settings block start msg: " + msg.url);
		//console.log("get settings block start src: " + src);
		// If src is null, we are very likely blocking something inside of another Google Chrome extension.
		// However, we don't have a good way of showing the whitelister.
		var theSettings = generateAllSettings(msg.url, null);	//((src && src.tab) ? src.tab.url : "")
		send(theSettings);
	}	
	else
	{
		send({});
	}
});


