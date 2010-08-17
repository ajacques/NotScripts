const MIN_PASSWORD_LENGTH = 20;
const MAX_PASSWORD_LENGTH = 100;

function isPasswordGood()
{
	if (ENCRYPTION_PASSWORD && ENCRYPTION_PASSWORD.length >= 20 && ENCRYPTION_PASSWORD.length <= 100 /*&& ENCRYPTION_PASSWORD != "FNqzJmJBA1GQFhuXBmEq20MqEqbn55w3MtT"*/)
	{
		return true;
	}
	else
	{
		return false;
	}
}

/*
RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// We must escape str to match correctly. The typical Internet code snippet incorrectly shows it without escaping, which is totally wrong.
String.prototype.startsWith = function(str) 
{return (this.match("^"+RegExp.escape(str))==str)};
String.prototype.endsWith = function(str) 
{return (this.match(RegExp.escape(str)+"$")==str)};
*/

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};
/*String.prototype.trim = function(){return 
(this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, ""))};*/
String.prototype.chunk = function(n) {
	if (typeof n=='undefined') n=2;
	return this.match(RegExp('.{1,'+n+'}','g'));
};

/*Array.prototype.compare = function(testArr) {
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) { 
            if (!this[i].compare(testArr[i])) return false;
        }
        if (this[i] !== testArr[i]) return false;
    }
    return true;
};*/

/*
Example for http://www.google.com/something.html, this returns www.google.com. Returns null if no match is found.
*/
function getMainURL(currURL)
{
	if (!currURL)
		return null;
	var splitURL = currURL.match(/^http[s]?:\/\/[^\.]+\.[^\/:]+/i);
	if (splitURL && splitURL.length > 0)
		return splitURL[0];
	else
		return null;
}

/*
Example for http://maps.google.com/something.html or maps.google.com, this returns google.com. Returns currURL if no match is found.
http://www.w3schools.com/HTML/html_url.asp
*/
function getPrimaryDomain(currURL)
{
	if (!currURL)
		return null;
	
	currURL = currURL.toLowerCase();
	
	var knownForms = currURL.match(/([^\.\/]+\.(asia|biz|cat|coop|edu|info|eu.int|int|gov|jobs|mil|mobi|name|tel|travel|aaa.pro|aca.pro|acct.pro|avocat.pro|bar.pro|cpa.pro|jur.pro|law.pro|med.pro|eng.pro|pro|ar.com|br.com|cn.com|de.com|eu.com|gb.com|hu.com|jpn.com|kr.com|no.com|qc.com|ru.com|sa.com|se.com|uk.com|us.com|uy.com|za.com|com|ab.ca|bc.ca|mb.ca|nb.ca|nf.ca|nl.ca|ns.ca|nt.ca|nu.ca|on.ca|pe.ca|qc.ca|sk.ca|yk.ca|gc.ca|ca|gb.net|se.net|uk.net|za.net|net|ae.org|za.org|org|[^\.\/]+\.uk|act.edu.au|nsw.edu.au|nt.edu.au|qld.edu.au|sa.edu.au|tas.edu.au|vic.edu.au|wa.edu.au|act.gov.au|nt.gov.au|qld.gov.au|sa.gov.au|tas.gov.au|vic.gov.au|wa.gov.au|[^\.\/]+\.au))($|\/|:){1}/i);
	if (knownForms && knownForms.length > 1)
		return knownForms[1]
	else
	{		
		var splitURL = currURL.toLowerCase().match(/^http[s]?:\/\/([^\.]+\.[^\/:]+)/i);
		if (splitURL && splitURL.length > 1)
		{
			var splitURL2 = splitURL[1].match(/^www\.([^\.]+\.[^\/]+)/i);
			if (splitURL2 && splitURL2.length > 1)
				return splitURL2[1];
			else
				return splitURL[1]
		}
		else
		{
			return currURL;
		}
	}
}


/*
Used to determine if a url matches a urlPattern.
url: URL to be tested. Must be in lower case.
urlPattern: The pattern to be matched. Must be in lower case.

Returns: Returns true if url starts with urlPattern. If urlPattern starts with a "^", then regular expression matching is used.
*/
function patternMatches(url, urlPattern)
{
	/*if (!url || !urlPattern)
		return false;
		
	if (RegExp('^\\^', 'i').test(urlPattern))
	{
		//^http[s]?:\/\/([^\.]+\.)*google.co.uk($|\/)
		return RegExp(urlPattern, 'i').test(url);			
	}
	else if (RegExp('^http[s]?:\/\/', 'i').test(urlPattern))
	{
		var startsMatch = (url.toLowerCase().indexOf(urlPattern.toLowerCase()) === 0 ? true : false);
		if (startsMatch && (url.length === urlPattern.length || url.charAt(urlPattern.length) === "/" || url.charAt(urlPattern.length) === ":"))
			return true
		else
			return false;
	}
	else*/
	{
		var coreUrl = getPrimaryDomain(url);
		
		if (!coreUrl)
			return false;
		coreUrl = coreUrl.toLowerCase();
		urlPattern = urlPattern.toLowerCase();		
		
		var endsMatch = false;
		var matchedIndex = coreUrl.indexOf(urlPattern);		
		if (matchedIndex >= 0 && (matchedIndex + urlPattern.length) === coreUrl.length)
		   endsMatch = true;
   
		if (!endsMatch)
			return false;
		if (coreUrl.length === urlPattern.length)
			return true;
		if (coreUrl.charAt(coreUrl.length - urlPattern.length - 1) === ".")
			return true;
		return false;
	}
}

function islisted(list, url) {
	if (!list || !url)
		return false;
		
	var isOnList = false;
	for (var i = 0; i < list.length; i++)
	{
		isOnList = patternMatches(url, list[i]);
		
		if (isOnList)
			break;
	}
	return isOnList;
}

/*
Returns a random string suitable for use as an id in html/javascript code.
Length is hardcoded to be between 30 and 40 characters
*/
function randomID()
{
	const length = 30 + Math.floor(Math.random() * 11);	// minimum 30, max 40
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_1234567890";	// total 63 characters
	var generated = chars.charAt(Math.floor(Math.random() * 53)); 

	for(var x=0;x<length;x++)
		generated += chars.charAt(Math.floor(Math.random() * 63));
		
	return generated;
}

/*
Takes in an array and shuffles it randomly in place using the Fisher Yates algorithm
array: Any array.
*/
function fisherYatesShuffle ( array ) 
{
	if (!array) return;
	var i = array.length;
	if (!i) return;
	
	while ( --i ) {
		var j = Math.floor( Math.random() * ( i + 1 ) );
		var tempi = array[i];
		var tempj = array[j];
		array[i] = tempj;
		array[j] = tempi;
	}
}

/*
function injectAnon(f) {
    var script = document.createElement("script");
	script.type = "text/javascript";
    script.textContent = "(" + f + ")();";
    document.documentElement.appendChild(script);
}

function injectGlobal(f) {
    var script = document.createElement("script");
	script.type = "text/javascript";
    script.textContent = f;
    document.documentElement.appendChild(script);
}

function injectGlobalWithId(f, id) {
    var script = document.createElement("script");
	script.type = "text/javascript";
	script.id = id;
    script.textContent = f;
    document.documentElement.appendChild(script);
}
*/

function relativeToAbsoluteUrl(url) {
    if(!url)
      return url;
   
    if(url.match(/^http/))
        return url;
		
    // Leading / means absolute path
    if(url[0] == '/')
        return document.location.protocol + "//" + document.location.host + url;

    // Remove filename and add relative URL to it
    var base = document.baseURI.match(/.+\//);
    if(!base) return document.baseURI + "/" + url;
    return base[0] + url;
}

const EL_TYPE = {
  "OTHER": 0,
  "SCRIPT": 1,
  "OBJECT": 2,
  "EMBED": 3,
  "IFRAME": 4
  
  /*
  "IMG": 5,
  "BODY": 6,
  "CSS": 7
  */
};

function getElType(el) {
	// Note: We cannot block java that uses the deprecated APPLET tags because it doesn't fire beforeload
	//console.log("nodeName: " + el.nodeName);
	switch (el.nodeName) 
	{
		case 'SCRIPT': return EL_TYPE.SCRIPT;
		case 'OBJECT': return EL_TYPE.OBJECT;
		case 'EMBED': return EL_TYPE.EMBED;
		case 'IFRAME': return EL_TYPE.IFRAME;
		
		/*
		case 'IMG': return EL_TYPE.IMG;
		case 'LINK': return EL_TYPE.CSS;
		case 'BODY': return EL_TYPE.BODY;
		*/
		default: return EL_TYPE.OTHER;
	}
}

function getElUrl(el, type) {
	//console.log("getElUrl: " + el.nodeName + "     " +  el.outerHTML);
	switch (el.nodeName) 
	{
		case 'SCRIPT': 
		{
			return el.src;
		}
		case 'EMBED':
		{
			// Does Google Chrome even use embeds?
			//console.log("Looking at embeds: ");
			
			if (el.src) return el.src;
			if (el.data) return el.data;
			if (el.codeBase) return el.codeBase;
			if (el.code) return el.code;
			return null;
		}
		case 'IFRAME': 
		{
			return el.src;
		}
		case 'OBJECT':
		{
			// If the data attribute is given, we know the source.
			if (el.data) return el.data;
			
			// Else if a codeBase is given, we have to look at the params to see if we can find the source of what is loading.
			// Will this cause compatibility problems?
			if (!el.codeBase) return null;
			
			var plist = el.getElementsByTagName('param');
			var codeSrc = null;
			for(var i=0; i < plist.length; i++){
				var paramName = plist[i].name.toLowerCase();
				
				//console.log("Looking at param: " + plist[i].name + "    " + plist[i].value);
				
				if(paramName === 'movie' || paramName === 'src' || paramName === 'codebase' || paramName === 'data')
					return plist[i].value;
				else if (paramName === 'code')
					codeSrc = plist[i].value;
			}
			return codeSrc;
			
		}
		
		/*
		case 'IMG':
		{
			return el.src;
		}
		case 'LINK':
		{
			return el.href;
		}
		case 'BODY':
		{
			var bgImage = getComputedStyle(el,'').getPropertyValue('background-image');
			if (bgImage && bgImage !== "none") return bgImage.replace(/"/g,"").replace(/url\(|\)$/ig, "");
			else return null;
		}
		*/
		default: return (el.src ? el.src : null);
	}
}