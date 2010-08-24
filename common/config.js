/*
This file should not to be used by content scripts.
It should only be loaded once in the extension, ie: background page.
Otherwise, you will have to worry about storage sync issues.
*/
var extFatalError = false;

var config = {
    has: function(key) {
        return key in localStorage;
    },
    get: function(key) {
        if (this.has(key)) {
            try {
                return JSON.parse(localStorage[key]);
            } catch(err) {
                return localStorage[key];
            }
        }
    },
    set: function(key, value) {
		try {
			localStorage[key] = JSON.stringify(value);
		} catch (err) {
			extFatalError = true;
			//if (err == QUOTA_EXCEEDED_ERR) {
				//alert('Local storage quota exceeded for NotScripts extension.');
			//}
		}
    },
    defaults: function(vals) {
        for (var key in vals) {
            if (!this.has(key)) {
				this.set(key, vals[key]);
            }
			else	// In case our data gets corrupted during end user use
			{
				var currVal = this.get(key);
				if (currVal === 'undefined' || currVal === 'null')
					this.set(key, vals[key]);			
			}
        };
    }
};

config.defaults({

    whitelist: ["google.com", "google.ca", "google.co.uk", "google.com.au", "googleapis.com", "gstatic.com", "youtube.com", "ytimg.com", 
		"live.com", "microsoft.com", "hotmail.com", "apple.com", "yahooapis.com", "yimg.com"],
	
	reloadCurrentTabOnToggle: true,
	showPageActionButton: true,
	
	lastVersion: 0,
	currVersion: 0,
	currDisplayVersion: "0.0.0",
	
	multiSelect: false,
	
	// Black list mode not current implemented
	useBlacklistMode: false,
	blacklist: []
});

var sessionConfig = {
    has: function(key) {
        return key in sessionStorage;
    },
    get: function(key) {
        if (this.has(key)) {
            try {
                return JSON.parse(sessionStorage[key]);
            } catch(e) {
                return sessionStorage[key];
            }
        }
    },
    set: function(key, value) {
		try {
			sessionStorage[key] = JSON.stringify(value);
		} catch (err) {
			extFatalError = true;
			//if (err == QUOTA_EXCEEDED_ERR) {
			//	alert('Session storage quota exceeded for NotScripts extension.');
			//}
		}
    },
    defaults: function(vals) {
        for (var key in vals) {
            if (!this.has(key) || typeof this.get(key) === 'undefined') {
                this.set(key, vals[key]);
            }
        };
    }
};

sessionConfig.defaults({
	tempAllowList: [],
	globalAllowAll: false
});

var whitelist = config.get('whitelist');
var tempAllowList = sessionConfig.get('tempAllowList');
var urlsGloballyAllowed = sessionConfig.get('globalAllowAll');

function clearSettings()
{
	extFatalError = false;
	sessionConfig.set("tempAllowList", []);
	config.set("blacklist", []);
	config.set("whitelist", []);
	window.location.reload();
}

function handleStorageChange(event)
{
	if (event.key === "whitelist")
	{
		whitelist = config.get('whitelist');
	}
	else if (event.key === "tempAllowList")
	{
		tempAllowList = sessionConfig.get('tempAllowList');
	}	
	else if (event.key === "globalAllowAll")
	{
		urlsGloballyAllowed = sessionConfig.get('globalAllowAll');
	}	
}

window.addEventListener("storage", handleStorageChange, false);

function isWhitelisted(url)
{
	return islisted(whitelist, url)
}

function isTempListed(url)
{
	return islisted(tempAllowList, url)
}

function isAllowed(url)
{
	return islisted(whitelist, url) || islisted(tempAllowList, url);
}

function permitUrl(url)
{
	removeFromList(tempAllowList, "tempAllowList", url, true);
	addToList(whitelist, "whitelist", url, false);
}

function revokeUrl(url)
{
	removeFromList(whitelist, "whitelist", url, false);
	removeFromList(tempAllowList, "tempAllowList", url, true);
}

function tempListPermitUrl(url)
{
	removeFromList(whitelist, "whitelist", url, false);
	
	if (!islisted(tempAllowList, url))
		addToList(tempAllowList, "tempAllowList", url, true);
}


function removeEmptyInArray(links)
{
	if (links)
	{
		for (var i = 0; i < links.length; i++)
		{
			if (links[i])
				links[i] = links[i].trim();
			if (!links[i])
			{
				links.splice(i, 1);
				i--;
			}			
		}
	}
	return links;
}

/*
Repairs conflicting rules or duplicates
*/
function cleanUpWhitelist()
{
	/*for (var i = 0; i < whitelist.length; i++)
	{

	}
	saveWhitelist(whitelist);*/
}

function saveWhitelist(newWhitelist)
{
	/*
	Need to change this to sorted list by reverse of the strings
	Example: Say we have
		zzz.aaa.com
		    aaa.com
			bbb.com
			
	Then we want it to sort to:
			aaa.com
		zzz.aaa.com	
			bbb.com
	*/
	config.set("whitelist", removeEmptyInArray(newWhitelist.values));
	whitelist = config.get('whitelist');	// This line required by Options.html to update correctly
}

function addToList(list, listName, url, isSession) {
	//Need to change this to sorted list by reverse of the strings
	list.push(url.toLowerCase());
	
	if (isSession)
		sessionConfig.set(listName, list);	
	else
		config.set(listName, list);	
}

function removeFromList(list, listName, url, isSession) {
	var isOnList = false;
	for (var i = 0; i < list.length; i++)
	{
		isOnList = patternMatches(url, list[i]);
		//isOnList = patternMatches(url, list[i]) || patternMatches(list[i], url);
		if (isOnList)
		{
			list.splice(i, 1);
			i--;
		}
	}
	
	// This is inefficient, we are saving the entire list each time
	if (isSession)
		sessionConfig.set(listName, list);	
	else
		config.set(listName, list);	
}





