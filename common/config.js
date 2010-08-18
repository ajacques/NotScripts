var config = {
    has: function(key) {
        return key in localStorage;
    },
    get: function(key) {
        if (this.has(key)) {
            try {
                return JSON.parse(localStorage[key]);
            } catch(e) {
                return localStorage[key];
            }
        }
    },
    set: function(key, value) {
		try {
			localStorage[key] = JSON.stringify(value);
		} catch (err) {
			if (err == QUOTA_EXCEEDED_ERR) {
				alert('Storage quota exceeded for NotScripts.');
			}
		}
    },
    defaults: function(vals) {
        for (var key in vals) {
            if (!this.has(key)) {
                this.set(key, vals[key]);
            }
        };
    }
};

config.defaults({

    whitelist: ["google.com", "google.ca", "google.co.uk", "google.com.au", "googleapis.com", "gstatic.com", "youtube.com", "ytimg.com", 
		"live.com", "microsoft.com", "hotmail.com", "apple.com", "yahooapis.com", "yimg.com"],
	
	globalAllowAll: false,
	reloadCurrentTabOnToggle: true,
	showPageActionButton: true,
	
	lastVersion: 0,
	currVersion: 0,
	currDisplayVersion: "0.0.0",
	
	// Black list mode not current implemented
	useBlacklistMode: false,
	blacklist: []
});

var isOldChrome = false;
/*
function determineIfOldChrome()
{
	var splitVer = navigator.appVersion.match(/^[0-9]+\.[0-9]+/i);
	if (splitVer && splitVer.length > 0)
	{
		try 
		{
			var verNum = parseFloat(splitVer[0]);
			if (verNum < 5.0)	// Versions of Google Chrome less than 5 may not have the local storage events we want
				return true;
			else
				return false;
		}
		catch (err)
		{
			return false;
		}
	}
	else
	{
		return false;
	}
}

if (!SAFARI)
	isOldChrome = determineIfOldChrome();
*/


var whitelist = config.get('whitelist');
var blacklist = config.get('blacklist');
var urlsGloballyAllowed = config.get('globalAllowAll');
var useBlacklistMode = config.get('useBlacklistMode');

function handleStorageChange(event)
{
	if (event.key === "whitelist")
	{
		whitelist = config.get('whitelist');
	}
	else if (event.key === "blacklist")
	{
		blacklist = config.get('blacklist');
	}
	else if (event.key === "globalAllowAll")
	{
		urlsGloballyAllowed = config.get('globalAllowAll');
	}
	else if (event.key === "useBlacklistMode")
	{
		useBlacklistMode = config.get('useBlacklistMode');
	}		
}

// Bug: Safari does not fire "storage" events
window.addEventListener("storage", handleStorageChange, false);


function isAllowed(url)
{
	if (SAFARI)
			useBlacklistMode = config.get('useBlacklistMode');
	if (useBlacklistMode)
		return !isBlacklisted(url);
	else
		return isWhitelisted(url);
}

function revokeUrl(url)
{
	if (SAFARI)
			useBlacklistMode = config.get('useBlacklistMode');
	if (useBlacklistMode)
		addToBlacklist(url);
	else
		removeFromWhitelist(url)
}

function permitUrl(url)
{
	if (SAFARI)
			useBlacklistMode = config.get('useBlacklistMode');
	if (useBlacklistMode)
		removeFromBlacklist(url);
	else
		addToWhitelist(url);
}

function addToList(list, listName, url) {
	list.push(url.toLowerCase());
	
	// This is inefficient, we are saving the entire list each time
	config.set(listName, list);	
}

function removeFromList(list, listName, url) {
	var isOnList = false;
	for (var i = 0; i < list.length; i++)
	{
		isOnList = patternMatches(url, list[i]);
		if (isOnList)
		{
			list.splice(i, 1);
			i--;
		}
	}
	
	// This is inefficient, we are saving the entire list each time
	config.set(listName, list);
}

function isWhitelisted(url) {
	if (SAFARI || isOldChrome)
		whitelist = config.get('whitelist');
	return islisted(whitelist, url);	
}

function addToWhitelist(url) {	
	if (SAFARI || isOldChrome)
		whitelist = config.get('whitelist');
	addToList(whitelist, "whitelist", url);
}

function removeFromWhitelist(url) {
	if (SAFARI || isOldChrome)
		whitelist = config.get('whitelist');
	removeFromList(whitelist, "whitelist", url);
}

function isBlacklisted(url) {
	if (SAFARI || isOldChrome)
		blacklist = config.get('blacklist');
	return islisted(blacklist, url);
}

function addToBlacklist(url) {	
	if (SAFARI || isOldChrome)
		blacklist = config.get('blacklist');
	addToList(blacklist, "blacklist", url);
}

function removeFromBlacklist(url) {
	if (SAFARI || isOldChrome)
		blacklist = config.get('blacklist');
	removeFromList(blacklist, "blacklist", url);
}




