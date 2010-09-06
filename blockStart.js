/* 
    NotScripts
    Copyright (C) 2010  Eric Wong	
	contact@optimalcycling.com
	http://www.optimalcycling.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const OUT_PUT_LOG = false;

if (OUT_PUT_LOG)
{
	if (window.top === window)
	{
		console.log("Top Start: " + window.location.href);
	}
	else
	{
		console.log("IFrame Start: " + window.location.href);
	}
	
	/*for (var i in localStorage)
	{
		console.log("localStorage begin: " + i + "  " + localStorage[i]);
	}

	for (var i in sessionStorage)
	{
		console.log("sessionStorage begin: " + i + "  " + sessionStorage[i]);
	}*/
}

// DO NOT reuse the following two names if you reuse this code because it will collide with NotScript!
// Pick your own random names.
// Also, be careful about compatibility issues with other extensions that use this code because you don't
// want multiple extensions reloading the page. That would be annoying.
const NAME_NOTSCRIPTS_ALLOWED = "dQGIgCdSC1FWpDUMWx1z";
const NAME_NOTSCRIPTS_WHITELIST = "WQQAW0JuSt0304877x4l";

const PASSWORD_GOOD = isPasswordGood();
const CURR_EPOCH = (new Date()).getTime(); // in milliseconds	
var fatalError = false;

// We are giving the user the option of putting
// const DO_NOT_BLOCK_IFRAMES = true;
// const DO_NOT_BLOCK_EMBEDS = true;
// const DO_NOT_BLOCK_OBJECTS = true;
// const DO_NOT_BLOCK_SCRIPTS = true;
// const DO_NOT_MITIGATE_INLINE_SCRIPTS = true;
// const BLOCKING_MODE = "BLACKLIST";
// into their CHANGE__PASSWORD__HERE.js file to disable each type of blocking.
const do_not_block_iframes = (((!(typeof DO_NOT_BLOCK_IFRAMES === 'undefined')) && DO_NOT_BLOCK_IFRAMES) ? true : false);
const do_not_block_embeds = (((!(typeof DO_NOT_BLOCK_EMBEDS === 'undefined')) && DO_NOT_BLOCK_EMBEDS) ? true : false);
const do_not_block_objects = (((!(typeof DO_NOT_BLOCK_OBJECTS === 'undefined')) && DO_NOT_BLOCK_OBJECTS) ? true : false);
const do_not_block_scripts = (((!(typeof DO_NOT_BLOCK_SCRIPTS === 'undefined')) && DO_NOT_BLOCK_SCRIPTS) ? true : false);
const do_not_mitigate_inline_scripts = (((!(typeof DO_NOT_MITIGATE_INLINE_SCRIPTS === 'undefined')) && DO_NOT_MITIGATE_INLINE_SCRIPTS) ? true : false);

var blockSettings = {
    has: function(key) {
		if (PASSWORD_GOOD === PASSWORD_STATUS.okay)
			return key in localStorage;
		else
			return null;
    },
    get: function(key) {
        if ((PASSWORD_GOOD === PASSWORD_STATUS.okay) && this.has(key)) {
			var decryptedData = null;
			try {
				decryptedData = sjcl.decrypt(ENCRYPTION_PASSWORD, localStorage[key]);
			} catch (err) {
				if (OUT_PUT_LOG) console.error("Error in NotScripts - blockStart.js (blockSettings.get): " + err);
				
				fatalError = true;
				localStorage[key] = null;
				return null;
			}
			
			try {
				return JSON.parse(decryptedData);
			} catch(err) {
				return decryptedData;
			}			
        }
		else
			return null;
    },
    set: function(key, value) {
		if ((PASSWORD_GOOD === PASSWORD_STATUS.okay))
		{
			try {
				localStorage[key] = sjcl.encrypt(ENCRYPTION_PASSWORD, JSON.stringify(value));
			} catch (err) {
				fatalError = true;
				/*if (OUT_PUT_LOG) console.error("Error in NotScripts - blockStart.js (blockSettings.set): " + err);
				if (err == QUOTA_EXCEEDED_ERR) {
					alert('localStorage quota exceeded for NotScripts on ' + window.location.href);
				}*/
			}
		}
		else
			return null;
    }
};

function genEmptyWhitelist()
{
	return {"whitelist": [], "whitelistHash": EMPTY_MD5,
		"globalAllowAll": false, "tempAllowList": [], "tempAllowListHash": EMPTY_MD5, "tempExpiry": 0,
		"blacklist": [], "blacklistHash": EMPTY_MD5};
}

// Set the default whitelist if it doesn't exist
// Note: We converted to a JSON representation in NotScripts V0.9.6.
// Before that it was an array so we have to detect and upgrade older data without deleting it.
if (!blockSettings.has(NAME_NOTSCRIPTS_WHITELIST)) {
	blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, genEmptyWhitelist());
}
var NotScripts_Whitelist = blockSettings.get(NAME_NOTSCRIPTS_WHITELIST);
if (isArray(NotScripts_Whitelist))	// Need to convert to new JSON format and sort
{
	if (OUT_PUT_LOG) 
		console.log("site whitelist isArray");
	if (!sortUrlList(NotScripts_Whitelist))	// in place sort
	{
		// There was an error sorting that requires us to reset the whitelist
		NotScripts_Whitelist = genEmptyWhitelist();	
		blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, NotScripts_Whitelist);
	}
	else
	{
		// The whitelistHash will be updated when we get the settings from the background page
		var emptyList = genEmptyWhitelist();
		emptyList.whitelist = NotScripts_Whitelist;
		emptyList.whitelistHash = "";
		NotScripts_Whitelist = emptyList;	
		blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, NotScripts_Whitelist);		
	}
}
else if (typeof NotScripts_Whitelist === 'undefined' || NotScripts_Whitelist === null 
	|| !isArray(NotScripts_Whitelist.whitelist) || !isArray(NotScripts_Whitelist.tempAllowList))	// data is corrupt
{
	if (OUT_PUT_LOG) 
		console.log("site whitelist corrupt");
	NotScripts_Whitelist = genEmptyWhitelist();	
	blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, NotScripts_Whitelist);
}

if (NotScripts_Whitelist.tempExpiry > 0 && NotScripts_Whitelist.tempExpiry < CURR_EPOCH)
{
	if (OUT_PUT_LOG) 
		console.log("temp list expired");
	NotScripts_Whitelist.tempAllowList = [];
	NotScripts_Whitelist.tempAllowListHash = EMPTY_MD5;
	NotScripts_Whitelist.globalAllowAll = false;
	NotScripts_Whitelist.tempExpiry = 0;
	blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, NotScripts_Whitelist);
}


function resetAllStorage(settings)
{
	localStorage.clear();
	sessionStorage.clear();	

	if (PASSWORD_GOOD === PASSWORD_STATUS.okay)
	{
		fatalError = false;
		blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, settings.whitelist);
		NotScripts_Whitelist = blockSettings.get(NAME_NOTSCRIPTS_WHITELIST);
	}

	if (settings.reload)
	{
		window.location.reload();
	}	
}

var pageSourcesAllowed = new Array();
var pageSourcesTempAllowed = new Array();
var pageSourcesForbidden = new Array();
var pageSourcesUntrusted = new Array();
var topDomain = getPrimaryDomain(window.location.href);

function isUntrusted(url)
{
	return (blocking_mode === BMODE_TYPES.WHITELIST_ALLOW_TOP_LEVEL ? islisted(NotScripts_Whitelist.blacklist, url) : false);
}

function isWhitelisted(url) {
	switch(blocking_mode)
	{
		case BMODE_TYPES.BLACKLIST:
		{
			return !islisted(NotScripts_Whitelist.blacklist, url);
		}
		case BMODE_TYPES.WHITELIST_ALLOW_TOP_LEVEL:
		{
			if (!islisted(NotScripts_Whitelist.blacklist, url))
			{
				return (patternMatches(url, topDomain)) || islisted(NotScripts_Whitelist.whitelist, url);
			}
			else
				return false;
		}
		default:	// BMODE_TYPES.WHITELIST
			return islisted(NotScripts_Whitelist.whitelist, url);
	}	
}

function isTempAllowListed(url) {	
	return islisted(NotScripts_Whitelist.tempAllowList, url);		
}

function isGloballyAllowed()
{
	return NotScripts_Whitelist.globalAllowAll;	
}

/*
function loadContent(event)
{
    const element = event.target;
    element.className = element.className.replace(" blocked-content", "");
    element.removeEventListener("click", loadContent, true);
    element.allowedToLoad = true;
    var nextSibling = element.nextSibling;
    var parentNode = element.parentNode;
    parentNode.removeChild(element);
    parentNode.insertBefore(element, nextSibling);
    event.stopPropagation();
    event.preventDefault();
}
*/

function blockScripts(event)
{
	var el = event.target;
	
    /*
    if (el.allowedToLoad)
        return;	
	*/
	
	var elType = getElType(el);
	var currUrl = relativeToAbsoluteUrl(getElUrl(el, elType));
	
	// Note: Inline scripts do not fire the beforeLoad event and so cannot be prevented from running
	if ((!do_not_block_iframes && (elType === EL_TYPE.IFRAME || elType === EL_TYPE.FRAME)) || 
		(!do_not_block_embeds && (elType === EL_TYPE.EMBED)) || 
		(!do_not_block_objects && (elType === EL_TYPE.OBJECT)) || 
		(!do_not_block_scripts && (elType === EL_TYPE.SCRIPT)))
	{			
		if (OUT_PUT_LOG) 
			console.log("Before " + currUrl);
		
		var mainURL = getPrimaryDomain((elType === EL_TYPE.IFRAME || elType === EL_TYPE.FRAME) ? window.location.href : currUrl);
		
		if (OUT_PUT_LOG) 
			console.log("After " + "   " + mainURL + "   " + NotScripts_Allowed.globalAllowAll + "    " + isWhitelisted(mainURL) + "   " + isTempAllowListed(mainURL));			
		
		if (PASSWORD_GOOD === PASSWORD_STATUS.okay)
		{	
			if (isUntrusted(mainURL))
			{
				if (pageSourcesUntrusted.indexOf(mainURL) < 0)
					pageSourcesUntrusted.push(mainURL);	
				preventAndAddToList(event, mainURL, pageSourcesUntrusted);
			}
			else if (isGloballyAllowed() || isWhitelisted(mainURL))  
			{
				if (pageSourcesAllowed.indexOf(mainURL) < 0)
					pageSourcesAllowed.push(mainURL);
			}
			else if (isTempAllowListed(mainURL))
			{
				if (pageSourcesTempAllowed.indexOf(mainURL) < 0)
					pageSourcesTempAllowed.push(mainURL);
			}
			else
			{
				preventAndAddToList(event, mainURL, pageSourcesForbidden);			
			}
		}
		else
		{
			preventAndAddToList(event, mainURL, pageSourcesForbidden);
		}	
	}
}

function preventAndAddToList(event, mainURL, list)
{
	/*
	var el = event.target;
	el.className += " blocked-content";
	el.addEventListener("click", loadContent, true);	
	*/
	
	event.preventDefault();
	
	if (list.indexOf(mainURL) < 0)
		list.push(mainURL);	
}

/*
Note: Mitigation is a stop gap measure for inline scripts unline Google Chrome fires beforeload events for them.
*/
function mitigateAndAddToList(mainURL, list)
{
	injectAnon(function(){
		for (var i in window)
		{
			try {
				var jsType = typeof window[i];
				switch (jsType.toUpperCase())
				{					
					case "FUNCTION": 
						if (window[i] !== window.location)
						{
							if (window[i] === window.open || (window.showModelessDialog && window[i] === window.showModelessDialog))
								window[i] = function(){return true;};
							else if (window[i] === window.onbeforeunload)	// To try to fix onbeforeunload pop ups some users report seeing but I can't replicate.
								window.onbeforeunload = null;
							else if (window[i] === window.onunload)
								window.onunload = null;								
							else
								window[i] = function(){return "";};
						}
						break;							
				}			
			}
			catch(err)
			{}		
		}
		
		for (var i in document)
		{
			try {
				var jsType = typeof document[i];
				switch (jsType.toUpperCase())
				{					
					case "FUNCTION":
						document[i] = function(){return "";};
						break;					
				}			
			}
			catch(err)
			{}		
		}

		try {
			eval = function(){return "";};				
			unescape = function(){return "";};
			String = function(){return "";};
			parseInt = function(){return "";};
			parseFloat = function(){return "";};
			Number = function(){return "";};
			isNaN = function(){return "";};
			isFinite = function(){return "";};
			escape = function(){return "";};
			encodeURIComponent = function(){return "";};
			encodeURI = function(){return "";};
			decodeURIComponent = function(){return "";};
			decodeURI = function(){return "";};
			Array = function(){return "";};
			Boolean = function(){return "";};
			Date = function(){return "";};
			Math = function(){return "";};
			Number = function(){return "";};
			RegExp = function(){return "";};
			
			var oNav = navigator;
			navigator = function(){return "";};
			oNav = null;			
		}
		catch(err)
		{}
		
	});		

	if (list.indexOf(mainURL) < 0)
		list.push(mainURL);	
}

/*
Since inline scripts don't fire beforeload events, the next best thing to do is mitigate them for now.
We can't "disable" all the core javascript functions, but we try to do the best we can.
*/
function mitigateInlineScripts()
{
	if (PASSWORD_GOOD === PASSWORD_STATUS.okay)
	{	
		if (isUntrusted(topDomain))
		{
			if (pageSourcesUntrusted.indexOf(topDomain) < 0)
				pageSourcesUntrusted.push(topDomain);

			mitigateAndAddToList(topDomain, pageSourcesUntrusted);
		}	
		else if (isGloballyAllowed() || isWhitelisted(topDomain))
		{
			if (pageSourcesAllowed.indexOf(topDomain) < 0)
				pageSourcesAllowed.push(topDomain);
		}
		else if (isTempAllowListed(topDomain))
		{
			if (pageSourcesTempAllowed.indexOf(topDomain) < 0)
				pageSourcesTempAllowed.push(topDomain);
		}
		else
		{
			mitigateAndAddToList(topDomain, pageSourcesForbidden);			
		}
	}
	else
	{
		mitigateAndAddToList(topDomain, pageSourcesForbidden);
	}		
}

function updateSettings(settings)
{
	if (!(PASSWORD_GOOD === PASSWORD_STATUS.okay))
		return;
		
	var needToReload = false;
	
	if (NotScripts_Whitelist.whitelistHash !== settings.whitelist.whitelistHash
		|| NotScripts_Whitelist.tempAllowListHash !== settings.whitelist.tempAllowListHash
		|| NotScripts_Whitelist.blacklistHash !== settings.whitelist.blacklistHash
		|| NotScripts_Whitelist.globalAllowAll !== settings.whitelist.globalAllowAll 
		|| NotScripts_Whitelist.tempExpiry !== settings.whitelist.tempExpiry) 
	{
		blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, settings.whitelist);
		NotScripts_Whitelist = settings.whitelist;
		
		if (NotScripts_Whitelist.globalAllowAll && pageSourcesForbidden.length > 0)
		{
			needToReload = true;
		}		
	}
	
	if (OUT_PUT_LOG) 
		console.log("after NotScripts_Whitelist.whitelist: " + NotScripts_Whitelist.whitelist);
	
	if (!needToReload && !isGloballyAllowed())
	{
		for (var i = 0; i < pageSourcesForbidden.length; i++)
		{
			if (isTempAllowListed(pageSourcesForbidden[i]) || isWhitelisted(pageSourcesForbidden[i]) || isUntrusted(pageSourcesForbidden[i]))
			{
				needToReload = true;
				break;
			}
		}

		for (var i in pageSourcesUntrusted)
		{
			if (!isUntrusted(pageSourcesUntrusted[i]))
			{
				needToReload = true;
				break;
			}
		}	

		var moveFromAllowed = new Array();
		if (!needToReload)
		{
			for (var i = 0; i < pageSourcesAllowed.length; i++)
			{
				if (isTempAllowListed(pageSourcesAllowed[i]))
				{
					moveFromAllowed.push(pageSourcesAllowed[i]);
					pageSourcesAllowed.splice(i, 1);
					i--;
				}
				else if (!isWhitelisted(pageSourcesAllowed[i]))
				{
					needToReload = true;
					break;				
				}
			}
		}
			
		var moveFromTempAllowed = new Array();
		if (!needToReload)
		{			
			for (var i = 0; i < pageSourcesTempAllowed.length; i++)
			{
				if (isWhitelisted(pageSourcesTempAllowed[i]))
				{
					moveFromTempAllowed.push(pageSourcesTempAllowed[i]);
					pageSourcesTempAllowed.splice(i, 1);
					i--;
				}
				else if (!isTempAllowListed(pageSourcesTempAllowed[i]))
				{
					needToReload = true;
					break;				
				}
			}
		}

		if (!needToReload)
		{			
			for (var i = 0; i < moveFromAllowed.length; i++)
			{
				pageSourcesTempAllowed.push(moveFromAllowed[i]);
			}
			
			for (var i = 0; i < moveFromTempAllowed.length; i++)
			{
				pageSourcesAllowed.push(moveFromTempAllowed[i]);
			}			
		}
	}
	
	if (settings.reload && needToReload && !fatalError)
	{
		if (OUT_PUT_LOG) 
			console.log("need to update");
		else
			window.location.reload();
	}
}


chrome.extension.sendRequest({"type": "get settings block start", "url": window.location.href, "currAllowed": isGloballyAllowed()}, updateSettings);
document.addEventListener("beforeload", blockScripts, true);

// Need to update the globalAllowAll to reflect the tempAllows, too
chrome.extension.onRequest.addListener(
  function(msg, src, send) {
	if (msg.type === "get sources")
	{
		if (window.top === window)
		{
			send({"globalAllowAll": isGloballyAllowed(), 
				"pageSourcesAllowed": pageSourcesAllowed, "pageSourcesTempAllowed": pageSourcesTempAllowed,
				"pageSourcesForbidden": pageSourcesForbidden, "pageSourcesUntrusted": pageSourcesUntrusted,
				"fatalError": fatalError, "url": window.location.href, "topDomain": topDomain, 
				"topDomainIsWhitelisted": (blocking_mode === BMODE_TYPES.WHITELIST_ALLOW_TOP_LEVEL ? islisted(NotScripts_Whitelist.whitelist, topDomain) : false) });
		}
		else
		{
			chrome.extension.sendRequest({"type": "get sources response", "globalAllowAll": isGloballyAllowed(), 
				"pageSourcesAllowed": pageSourcesAllowed, "pageSourcesTempAllowed": pageSourcesTempAllowed,
				"pageSourcesForbidden": pageSourcesForbidden, "pageSourcesUntrusted": pageSourcesUntrusted,
				"fatalError": fatalError, "url": window.location.href, "topDomain": topDomain, 
				"topDomainIsWhitelisted": (blocking_mode === BMODE_TYPES.WHITELIST_ALLOW_TOP_LEVEL ? islisted(NotScripts_Whitelist.whitelist, topDomain) : false) });				
		}
	} 
	else if (msg.type === "get sources for top window")	// Used to update the state icon of the website
	{
		if (window.top === window)
		{
			send({"globalAllowAll": isGloballyAllowed(), 
				"pageSourcesAllowedLength": pageSourcesAllowed.length + pageSourcesTempAllowed.length,
				"pageSourcesForbiddenLength": pageSourcesForbidden.length + pageSourcesUntrusted.length, 
				"fatalError": fatalError, "url": window.location.href, "topDomain": topDomain});
		}
	} 			
	else if (msg.type === "update settings")
	{
		updateSettings(msg);
		send({});
	} 	
	else if (msg.type === "reset all storage")
	{
		resetAllStorage(msg);
		send({});
	}	
	else
		send({});
  });
  
if (!do_not_mitigate_inline_scripts)
	mitigateInlineScripts();
		  		  








