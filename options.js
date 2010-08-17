function lines(s) 
{ 
	var links = (s ? s.split('\n') : []); 
	if (links)
	{
		for (var i = 0; i < links.length; i++)
		{
			if (links[i])
				links[i] = links[i].trim();
			if (!links[i] || links.length === 0)
			{
				links.splice(i, 1);
				i--;
			}			
		}
		links.sort();
	}
	return links;
}

function init() {
	if(!isPasswordGood())
	{
		$('#passwordBad').css({"display": "block"});
		$('#passwordGood').css({"display": "none"});
	}
	else
	{
		$('#passwordBad').css({"display": "none"});
		$('#passwordGood').css({"display": "block"});
	}
	
	var extensionId = chrome.extension.getURL("").match(/[^\/:]+:\/\/([^\/]+)/i);
	extensionId = (extensionId.length > 1 ? extensionId[1] : "");
	$("span[name=extensionId]").text(extensionId);
	
	
	$('#whitelist').val(whitelist.join('\n'));
	$('#labelHeaderVersion').text('Version ' + config.get('currDisplayVersion'));
	
	// Note: jquery has a bug where the radio buttons can't be rechecked through code
	$('#radio_ON_ReloadTabs').attr('checked', config.get('reloadCurrentTabOnToggle'));
	$('#radio_OFF_ReloadTabs').attr('checked', !config.get('reloadCurrentTabOnToggle'));
	
	$('#radio_ON_ShowActionButton').attr('checked', config.get('showPageActionButton'));
	$('#radio_OFF_ShowActionButton').attr('checked', !config.get('showPageActionButton'));
}

function save() {
    config.set('whitelist', lines($('#whitelist').val()));
	config.set('reloadCurrentTabOnToggle', $('#radio_ON_ReloadTabs').attr('checked') ? true : false);
	config.set('showPageActionButton', $('#radio_ON_ShowActionButton').attr('checked') ? true : false);
}

function handleStorageChangeUpdateLists(event)
{
	// Bug: The jquery elements are not refreshing when jquery is used to call save even though the actual data is saved
	//chrome.extension.getBackgroundPage().console.log(event.key);
	if (event.key === "whitelist")
	{
		$('#whitelist').val(whitelist.join('\n'));
	}
	else if (event.key === "reloadCurrentTabOnToggle")
	{
		$('#radio_ON_ReloadTabs').attr('checked', config.get('reloadCurrentTabOnToggle'));
		$('#radio_OFF_ReloadTabs').attr('checked', !config.get('reloadCurrentTabOnToggle'));
	}	
	else if (event.key === "showPageActionButton")
	{
		$('#radio_ON_ShowActionButton').attr('checked', config.get('showPageActionButton'));
		$('#radio_OFF_ShowActionButton').attr('checked', !config.get('showPageActionButton'));
	}	
}

// Bug: Safari does not fire "storage" events
window.addEventListener("storage", handleStorageChangeUpdateLists, false);