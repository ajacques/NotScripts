const bgPage = chrome.extension.getBackgroundPage();

function lines(s) 
{ 
	var links = (s ? s.split('\n') : []);
	for (var i in links)
		links[i] = encodeURI(links[i]);
	return links;
}

function init() {
	switch (isPasswordGood())
	{
		case PASSWORD_STATUS.tooShort:
			$('#passwordBad').css({"display": "block"});
			$('#passwordGood').css({"display": "none"});	
			$("span[name=pwdProbDescrip]").text("Problem: Password is too short, must be at least " + MIN_PASSWORD_LENGTH + " characters.");
			break;
		case PASSWORD_STATUS.tooLong:
			$('#passwordBad').css({"display": "block"});
			$('#passwordGood').css({"display": "none"});	
			$("span[name=pwdProbDescrip]").text("Problem: Password is too long, must be no greater than " + MAX_PASSWORD_LENGTH + " characters.");
			break;
		case PASSWORD_STATUS.empty:
			$('#passwordBad').css({"display": "block"});
			$('#passwordGood').css({"display": "none"});	
			$("span[name=pwdProbDescrip]").text("Problem: Password is empty.");
			break;
		case PASSWORD_STATUS.invalidChars:
			$('#passwordBad').css({"display": "block"});
			$('#passwordGood').css({"display": "none"});	
			$("span[name=pwdProbDescrip]").text("Problem: Password contains invalid characters.");
			break;
		case PASSWORD_STATUS.okay:
			$('#passwordBad').css({"display": "none"});
			$('#passwordGood').css({"display": "block"});
			break;
		case PASSWORD_STATUS.undefined:
			$('#passwordBad').css({"display": "block"});
			$('#passwordGood').css({"display": "none"});	
			$("span[name=pwdProbDescrip]").text("Problem: Your password file is missing/invalid characters are present/the syntax is incorrect.");
			break;			
		default:
			$('#passwordBad').css({"display": "block"});
			$('#passwordGood').css({"display": "none"});	
			$("span[name=pwdProbDescrip]").text("Problem: Unknown problem with password/file.");
			break;			
	}
	
	var extensionId = chrome.extension.getURL("").match(/[^\/:]+:\/\/([^\/]+)/i);
	extensionId = (extensionId.length > 1 ? extensionId[1] : "");
	$("span[name=extensionId]").text(extensionId);
	
	if (bgPage.config.get('currVersion') !== bgPage.config.get('lastVersion'))
	{
		if (bgPage.config.get('lastVersion'))	// Not first install so show that we updated
		{
			$('#extUpdated').css({"display": "block"});
			var newDisplayVersion = bgPage.config.get('currDisplayVersion');
			$("span[name=updatedToVer]").text(newDisplayVersion);
		}
		else
		{
			$('#extUpdated').css({"display": "none"});
		}
		
		bgPage.config.set('lastVersion', bgPage.config.get('currVersion'));
	}
	else
	{
		$('#extUpdated').css({"display": "none"});
	}
	
	$('#whitelist').val(bgPage.whitelist.sort().join('\n'));
	$('#labelHeaderVersion').text('Version ' + bgPage.config.get('currDisplayVersion'));
	
	// Note: jquery has a bug where the radio buttons can't be rechecked through code
	$('#radio_ON_ReloadTabs').attr('checked', bgPage.config.get('reloadCurrentTabOnToggle'));
	$('#radio_OFF_ReloadTabs').attr('checked', !bgPage.config.get('reloadCurrentTabOnToggle'));
	
	$('#radio_ON_ShowActionButton').attr('checked', bgPage.config.get('showPageActionButton'));
	$('#radio_OFF_ShowActionButton').attr('checked', !bgPage.config.get('showPageActionButton'));
	
	if (bgPage.extFatalError)
		$('#extFatalError').css({"display": "block"});
}

function save() {
	bgPage.saveWhitelist({"values": lines($('#whitelist').val())});
	
	bgPage.config.set('reloadCurrentTabOnToggle', $('#radio_ON_ReloadTabs').attr('checked') ? true : false);
	bgPage.config.set('showPageActionButton', $('#radio_ON_ShowActionButton').attr('checked') ? true : false);
}

function handleStorageChangeUpdateLists(event)
{
	// Bug: The jquery elements are not refreshing when jquery is used to call save even though the actual data is saved
	//chrome.extension.getBackgroundPage().console.log(event.key);
	if (event.key === "whitelist")
	{
		$('#whitelist').val(bgPage.whitelist.sort().join('\n'));
	}	
}

window.addEventListener("storage", handleStorageChangeUpdateLists, false);