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

// DO NOT reuse the following two names if you reuse this code because it will collide with NotScript!
// Pick your own random names.
const NAME_NOTSCRIPTS_ALLOWED = "dQGIgCdSC1FWpDUMWx1z";
const NAME_NOTSCRIPTS_WHITELIST = "WQQAW0JuSt0304877x4l";

const PASSWORD_GOOD = isPasswordGood();

var fatalError = false;

// We are giving the user the option of putting
// const DO_NOT_BLOCK_IFRAMES = false;	// true or undefined to not block iframes, false to block
// const DO_NOT_BLOCK_EMBEDS = true;
// const DO_NOT_BLOCK_OBJECTS = true;
// const DO_NOT_BLOCK_SCRIPTS = true;
// const DO_NOT_MITIGATE_INLINE_SCRIPTS = true;
// into their CHANGE__PASSWORD__HERE.js file to disable blocking.
const do_not_block_iframes = (!(typeof DO_NOT_BLOCK_IFRAMES === 'undefined') ? (DO_NOT_BLOCK_IFRAMES ? true : false) : true);
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

// Set the default whitelist if it doesn't exist
if (!blockSettings.has(NAME_NOTSCRIPTS_WHITELIST) || !blockSettings.get(NAME_NOTSCRIPTS_WHITELIST)) {
	blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, new Array());
}
	
var sessionBlockSettings = {
    has: function(key) {
		if (PASSWORD_GOOD === PASSWORD_STATUS.okay)
			return key in sessionStorage;
		else
			return null;
    },
    get: function(key) {
        if ((PASSWORD_GOOD === PASSWORD_STATUS.okay) && this.has(key)) {
			var decryptedData = null;
			try {
				decryptedData = sjcl.decrypt(ENCRYPTION_PASSWORD, sessionStorage[key]);
			} catch (err) {
				if (OUT_PUT_LOG) console.error("Error in NotScripts - blockStart.js (sessionBlockSettings.get): " + err);
				fatalError = true;
				sessionStorage[key] = null;
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
		if (PASSWORD_GOOD === PASSWORD_STATUS.okay)
		{
			try {
				sessionStorage[key] = sjcl.encrypt(ENCRYPTION_PASSWORD, JSON.stringify(value));
			} catch (err) {
				fatalError = true;
				/*if (OUT_PUT_LOG) console.error("Error in NotScripts - blockStart.js (sessionBlockSettings.set): " + err);
				if (err == QUOTA_EXCEEDED_ERR) {
					alert('sessionStorage quota exceeded for NotScripts on ' + window.location.href);
				}*/
			}
		}
		else
			return null;
    }
};
	
// Set the default allow value if it doesn't exist
if (!sessionBlockSettings.has(NAME_NOTSCRIPTS_ALLOWED) || !sessionBlockSettings.get(NAME_NOTSCRIPTS_ALLOWED)) {
	sessionBlockSettings.set(NAME_NOTSCRIPTS_ALLOWED, {"globalAllowAll": false, "tempAllowList": []});
}

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

var pageSourcesAllowed = new Array();
var pageSourcesForbidden = new Array();
var NotScripts_Allowed = sessionBlockSettings.get(NAME_NOTSCRIPTS_ALLOWED);
var NotScripts_Whitelist = blockSettings.get(NAME_NOTSCRIPTS_WHITELIST);

function isWhitelisted(url) {
	return islisted(NotScripts_Whitelist, url);	
}

function isTempAllowListed(url) {
	//return islisted(NotScripts_Allowed.tempAllowList, url);	
	return false;
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
	if ((!do_not_block_iframes && (elType === EL_TYPE.IFRAME)) || 
		(!do_not_block_embeds && (elType === EL_TYPE.EMBED)) || 
		(!do_not_block_objects && (elType === EL_TYPE.OBJECT)) || 
		(!do_not_block_scripts && (elType === EL_TYPE.SCRIPT)))
	{			
		//console.log("Before " + currUrl);
		
		var mainURL = getPrimaryDomain(currUrl);
		
		//console.log("Allowed " + currUrl + "   " + mainURL + "   " + NotScripts_Allowed.globalAllowAll + "    " + isWhitelisted(mainURL) + "   " + isTempAllowListed(mainURL));			
		
		if ((PASSWORD_GOOD === PASSWORD_STATUS.okay) && (NotScripts_Allowed.globalAllowAll || isWhitelisted(mainURL) || isTempAllowListed(mainURL)))
		{	
			if (pageSourcesAllowed.indexOf(mainURL) < 0)
				pageSourcesAllowed.push(mainURL);		
		}
		else
		{
			/*
			el.className += " blocked-content";
			el.addEventListener("click", loadContent, true);	
			*/
			
			event.preventDefault();
			
			if (pageSourcesForbidden.indexOf(mainURL) < 0)
				pageSourcesForbidden.push(mainURL);		
		}	
	}
}

/*
Since inline scripts don't fire beforeload events, the next best thing to do is mitigate them for now.
We can't "disable" all the core javascript functions, but we try to do the best we can.
*/
function mitigateInlineScripts()
{
	var mainURL = getPrimaryDomain(window.location.href);

	if ((PASSWORD_GOOD === PASSWORD_STATUS.okay) && (NotScripts_Allowed.globalAllowAll || isWhitelisted(mainURL) || isTempAllowListed(mainURL)))
	{
		if (pageSourcesAllowed.indexOf(mainURL) < 0)
			pageSourcesAllowed.push(mainURL);		
	}
	else
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
								if (window[i] === window.open || window[i] === window.showModelessDialog)
									window[i] = function(){return true;};	// for pop ups
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
							//if (document[i] != document.write)	//comment this line out if not debugging
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
			}
			catch(err)
			{}
			
		});		

		if (pageSourcesForbidden.indexOf(mainURL) < 0)
			pageSourcesForbidden.push(mainURL);		
	}
}

function updateSettings(settings)
{
	if (!(PASSWORD_GOOD === PASSWORD_STATUS.okay))
		return;

	if (OUT_PUT_LOG) 
		console.log("updateSettings NotScripts_Allowed.globalAllowAll From " + NotScripts_Allowed.globalAllowAll + " to " + settings.tempVals.globalAllowAll);

	var needToReload = false;
	if (NotScripts_Allowed.globalAllowAll !== settings.tempVals.globalAllowAll)
	{
		sessionBlockSettings.set(NAME_NOTSCRIPTS_ALLOWED, settings.tempVals);
		NotScripts_Allowed = sessionBlockSettings.get(NAME_NOTSCRIPTS_ALLOWED);

		if (NotScripts_Allowed.globalAllowAll && pageSourcesForbidden.length > 0)
			needToReload = true;
	}	
		
	blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, settings.whitelist);
	NotScripts_Whitelist = blockSettings.get(NAME_NOTSCRIPTS_WHITELIST);
	
	if (!needToReload && !NotScripts_Allowed.globalAllowAll)
	{		
		for (var i in pageSourcesAllowed)
		{
			if (!isWhitelisted(pageSourcesAllowed[i]))
			{
				needToReload = true;
				break;
			}
		}

		if (!needToReload)
			for (var i in pageSourcesForbidden)
			{
				if (isWhitelisted(pageSourcesForbidden[i]))
				{
					needToReload = true;
					break;
				}
			}
	}
		
	if (settings.reload && needToReload && !fatalError)
	{
		window.location.reload();
	}
}


chrome.extension.sendRequest({"type": "get settings block start", "url": window.location.href, "currAllowed": NotScripts_Allowed.globalAllowAll}, updateSettings);
document.addEventListener("beforeload", blockScripts, true);

// Need to update the globalAllowAll to reflect the tempAllows, too
chrome.extension.onRequest.addListener(
  function(msg, src, send) {
	if (msg.type === "get sources")
	{
		if (window.top === window)
		{
			send({"globalAllowAll": NotScripts_Allowed.globalAllowAll, "pageSourcesAllowed": pageSourcesAllowed, "pageSourcesForbidden": pageSourcesForbidden, "fatalError": fatalError, "url": window.location.href});
		}
		else
		{
			chrome.extension.sendRequest({"type": "get sources response", "globalAllowAll": NotScripts_Allowed.globalAllowAll, "pageSourcesAllowed": pageSourcesAllowed, 
				"pageSourcesForbidden": pageSourcesForbidden, "fatalError": fatalError, "url": window.location.href});				
		}
	} 
	else if (msg.type === "get sources for top window")	// Used to update the state icon of the website
	{
		if (window.top === window)
		{
			send({"globalAllowAll": NotScripts_Allowed.globalAllowAll, "pageSourcesAllowedLength": pageSourcesAllowed.length, "pageSourcesForbiddenLength": pageSourcesForbidden.length, "fatalError": fatalError, "thisUrl": window.location.href});
		}
	} 			
	else if (msg.type === "update settings")
	{
		updateSettings(msg);
		send({});
	} 			
	else
		send({});
  });
  
if (!do_not_mitigate_inline_scripts)
	mitigateInlineScripts();
		  		  








