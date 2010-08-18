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
// Pick your own random names
const NAME_NOTSCRIPTS_ALLOWED = "dQGIgCdSC1FWpDUMWx1z";
const NAME_NOTSCRIPTS_WHITELIST = "WQQAW0JuSt0304877x4l";

const PASSWORD_GOOD = isPasswordGood();

var fatalError = false;

const do_not_block_iframes = (((!(typeof DO_NOT_BLOCK_IFRAMES === 'undefined')) && DO_NOT_BLOCK_IFRAMES) ? true : false);
const do_not_block_embeds = (((!(typeof DO_NOT_BLOCK_EMBEDS === 'undefined')) && DO_NOT_BLOCK_EMBEDS) ? true : false);
const do_not_block_objects = (((!(typeof DO_NOT_BLOCK_OBJECTS === 'undefined')) && DO_NOT_BLOCK_OBJECTS) ? true : false);
const do_not_block_scripts = (((!(typeof DO_NOT_BLOCK_SCRIPTS === 'undefined')) && DO_NOT_BLOCK_SCRIPTS) ? true : false);

var blockSettings = {
    has: function(key) {
		if (PASSWORD_GOOD)
			return key in localStorage;
		else
			return null;
    },
    get: function(key) {
        if (PASSWORD_GOOD && this.has(key)) {
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
		if (PASSWORD_GOOD)
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
if (!blockSettings.has(NAME_NOTSCRIPTS_WHITELIST)) {
	blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, new Array());
}
	
var sessionBlockSettings = {
    has: function(key) {
		if (PASSWORD_GOOD)
			return key in sessionStorage;
		else
			return null;
    },
    get: function(key) {
        if (PASSWORD_GOOD && this.has(key)) {
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
		if (PASSWORD_GOOD)
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
if (!sessionBlockSettings.has(NAME_NOTSCRIPTS_ALLOWED)) {
	sessionBlockSettings.set(NAME_NOTSCRIPTS_ALLOWED, false);
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
	/*
	if (SAFARI)
	{
		if (safari.self.tab.canLoad(event, { url: event.url, nodeName: element.nodeName }))
			return;
	}*/
	
	var elType = getElType(el);
	var currUrl = relativeToAbsoluteUrl(getElUrl(el, elType));
	
	if ((!do_not_block_iframes && (elType === EL_TYPE.IFRAME)) || 
		(!do_not_block_embeds && (elType === EL_TYPE.EMBED)) || 
		(!do_not_block_objects && (elType === EL_TYPE.OBJECT)) || 
		(!do_not_block_scripts && (elType === EL_TYPE.SCRIPT)))
	
	// Note: Inline scripts do not fire the beforeLoad event and so cannot be prevented from running
	//if (elType === EL_TYPE.IFRAME || elType === EL_TYPE.EMBED || elType === EL_TYPE.OBJECT 
	//	|| elType === EL_TYPE.SCRIPT)
	{			
		var mainURL = getPrimaryDomain(currUrl);
		
		//console.log("Testing " + currUrl + "   " + NotScripts_Allowed + "    " + isWhitelisted(mainURL) + "   " + NotScripts_Whitelist);
		
		if (PASSWORD_GOOD /*&& !fatalError*/ && (NotScripts_Allowed || isWhitelisted(mainURL)))
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

function updateSettings(settings)
{
	if (!PASSWORD_GOOD)
	{
		return;
	}

	if (OUT_PUT_LOG) 
		console.log("updateSettings " + NAME_NOTSCRIPTS_ALLOWED + ": From " + NotScripts_Allowed + " to " + settings.enabled);

	var needToReload = false;
	if (NotScripts_Allowed !== settings.enabled)
	{
		sessionBlockSettings.set(NAME_NOTSCRIPTS_ALLOWED, settings.enabled);
		NotScripts_Allowed = sessionBlockSettings.get(NAME_NOTSCRIPTS_ALLOWED);
		
		if (NotScripts_Allowed && pageSourcesForbidden.length > 0)
			needToReload = true;
	}	

		
	blockSettings.set(NAME_NOTSCRIPTS_WHITELIST, settings.whitelist);
	NotScripts_Whitelist = blockSettings.get(NAME_NOTSCRIPTS_WHITELIST);
	
	if (!needToReload && !NotScripts_Allowed)
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


chrome.extension.sendRequest({"type": "get settings block start", "url": window.location.href, "currAllowed": NotScripts_Allowed}, updateSettings);

// In Safari, we have to make a call to tell the browser to update the browser button or it will show the wrong one on load of a new page
if (SAFARI)
{	
	if (window.top === window)
	{
		chrome.extension.sendRequest({"type": "safari validate", "url": window.location.href});
	}
}

document.addEventListener("beforeload", blockScripts, true);

if (SAFARI)
{
	// I believe dispatchMessage is asynchronous, unlike canLoad which is blocking. 
	// Therefore, we have to send messages back instead of putting it in event.message.
	// safari.self.tab.dispatchMessage("get last blocked", "data");
	// safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("get last blocked", "data");
	// safari.self.tabs[0].page.dispatchMessage("get last blocked", "data");
	safari.self.addEventListener("message", function(event) { 
		switch (event.name) {
			case "get sources":
				var msg = event.message;
				chrome.extension.sendRequest({"type": "get sources response", "enabled": NotScripts_Allowed, "pageSourcesAllowed": pageSourcesAllowed, 
					"pageSourcesForbidden": pageSourcesForbidden, "fatalError": fatalError, "url": window.location.href});					
				break;
		}			
	}, false);	
}
else
{
	// Safari does not like the following listener in this content script for some reason. It won't run it.
	// Will have to use the Safari specific way.
	chrome.extension.onRequest.addListener(
	  function(msg, src, send) {
		//if(OUT_PUT_LOG) console.log("In addListener");
		
		if (msg.type === "get sources")
		{
			if (window.top === window)
			{
				send({"enabled": NotScripts_Allowed, "pageSourcesAllowed": pageSourcesAllowed, "pageSourcesForbidden": pageSourcesForbidden, "fatalError": fatalError, "url": window.location.href});
			}
			else
			{
				chrome.extension.sendRequest({"type": "get sources response", "enabled": NotScripts_Allowed, "pageSourcesAllowed": pageSourcesAllowed, 
					"pageSourcesForbidden": pageSourcesForbidden, "fatalError": fatalError, "url": window.location.href});				
			}
		} 
		else if (msg.type === "get sources for top window")	// Used to update the state icon of the website
		{
			if (window.top === window)
			{
				send({"enabled": NotScripts_Allowed, "pageSourcesAllowed": pageSourcesAllowed, "pageSourcesForbidden": pageSourcesForbidden, "fatalError": fatalError, "thisUrl": window.location.href});
			}
		} 			
		else if (msg.type === "update settings")
		{
			if(OUT_PUT_LOG) console.log("update settings global allow: " + msg.enabled);
			updateSettings(msg);
			send({});
		} 			
		else
			send({});
	  });
}		  		  








