String.prototype.trim = function () {
	// http://blog.stevenlevithan.com/archives/faster-trim-javascript
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};
String.prototype.chunk = function(n) {
	if (typeof n=='undefined') n=2;
	return this.match(RegExp('.{1,'+n+'}','g'));
};

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]'; 
}


const MIN_PASSWORD_LENGTH = 20;
const MAX_PASSWORD_LENGTH = 100;

// To be used...
const PASSWORD_STATUS = {
  "other": 0,	// The checking should not have to use this normally.
  "tooShort": 1,
  "tooLong": 2,
  "empty": 3,
  "invalidChars": 4,	// We won't be checking this for now since empty/undefined/or a syntax error would throw first.
  "okay": 5,
  "undefined": 6
};

function isPasswordGood()
{
	if (typeof ENCRYPTION_PASSWORD === 'undefined')
		return PASSWORD_STATUS.undefined;
	else if (ENCRYPTION_PASSWORD === null || ENCRYPTION_PASSWORD === "")
		return PASSWORD_STATUS.empty;
	else if (ENCRYPTION_PASSWORD.length < MIN_PASSWORD_LENGTH)
		return PASSWORD_STATUS.tooShort;
	else if (ENCRYPTION_PASSWORD.length > MAX_PASSWORD_LENGTH)
		return PASSWORD_STATUS.tooLong;
	else 
		return PASSWORD_STATUS.okay;
}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
// http://stevenlevithan.com/demo/parseuri/js/
// parseUri does not handle IPv6 addresses
function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

// These are some of the common and known top level domains from Mozilla's http://publicsuffix.org/
// They are used to remove the subdomains from url's with known top level domains
// A more complete list will be generated in the future
const reKnownTLDs = /^(asia|biz|cat|coop|edu|info|eu.int|int|gov|jobs|mil|mobi|name|tel|travel|aaa.pro|aca.pro|acct.pro|avocat.pro|bar.pro|cpa.pro|jur.pro|law.pro|med.pro|eng.pro|pro|ar.com|br.com|cn.com|de.com|eu.com|gb.com|hu.com|jpn.com|kr.com|no.com|qc.com|ru.com|sa.com|se.com|uk.com|us.com|uy.com|za.com|com|ab.ca|bc.ca|mb.ca|nb.ca|nf.ca|nl.ca|ns.ca|nt.ca|nu.ca|on.ca|pe.ca|qc.ca|sk.ca|yk.ca|gc.ca|ca|gb.net|se.net|uk.net|za.net|net|ae.org|za.org|org|[^\.\/]+\.uk|act.edu.au|nsw.edu.au|nt.edu.au|qld.edu.au|sa.edu.au|tas.edu.au|vic.edu.au|wa.edu.au|act.gov.au|nt.gov.au|qld.gov.au|sa.gov.au|tas.gov.au|vic.gov.au|wa.gov.au|[^\.\/]+\.au|de|dk|tv|com.ly|net.ly|gov.ly|plc.ly|edu.ly|sch.ly|med.ly|org.ly|id.ly|ly|xn--55qx5d.hk|xn--wcvs22d.hk|xn--lcvr32d.hk|xn--mxtq1m.hk|xn--gmqw5a.hk|xn--ciqpn.hk|xn--gmq050i.hk|xn--zf0avx.hk|xn--io0a7i.hk|xn--mk0axi.hk|xn--od0alg.hk|xn--od0aq3b.hk|xn--tn0ag.hk|xn--uc0atv.hk|xn--uc0ay4a.hk|com.hk|edu.hk|gov.hk|idv.hk|net.hk|org.hk|hk|ac.cn|com.cn|edu.cn|gov.cn|net.cn|org.cn|mil.cn|xn--55qx5d.cn|xn--io0a7i.cn|xn--od0alg.cn|ah.cn|bj.cn|cq.cn|fj.cn|gd.cn|gs.cn|gz.cn|gx.cn|ha.cn|hb.cn|he.cn|hi.cn|hl.cn|hn.cn|jl.cn|js.cn|jx.cn|ln.cn|nm.cn|nx.cn|qh.cn|sc.cn|sd.cn|sh.cn|sn.cn|sx.cn|tj.cn|xj.cn|xz.cn|yn.cn|zj.cn|hk.cn|mo.cn|tw.cn|cn|edu.tw|gov.tw|mil.tw|com.tw|net.tw|org.tw|idv.tw|game.tw|ebiz.tw|club.tw|xn--zf0ao64a.tw|xn--uc0atv.tw|xn--czrw28b.tw|tw|aichi.jp|akita.jp|aomori.jp|chiba.jp|ehime.jp|fukui.jp|fukuoka.jp|fukushima.jp|gifu.jp|gunma.jp|hiroshima.jp|hokkaido.jp|hyogo.jp|ibaraki.jp|ishikawa.jp|iwate.jp|kagawa.jp|kagoshima.jp|kanagawa.jp|kawasaki.jp|kitakyushu.jp|kobe.jp|kochi.jp|kumamoto.jp|kyoto.jp|mie.jp|miyagi.jp|miyazaki.jp|nagano.jp|nagasaki.jp|nagoya.jp|nara.jp|niigata.jp|oita.jp|okayama.jp|okinawa.jp|osaka.jp|saga.jp|saitama.jp|sapporo.jp|sendai.jp|shiga.jp|shimane.jp|shizuoka.jp|tochigi.jp|tokushima.jp|tokyo.jp|tottori.jp|toyama.jp|wakayama.jp|yamagata.jp|yamaguchi.jp|yamanashi.jp|yokohama.jp|ac.jp|ad.jp|co.jp|ed.jp|go.jp|gr.jp|lg.jp|ne.jp|or.jp|jp|co.in|firm.in|net.in|org.in|gen.in|ind.in|nic.in|ac.in|edu.in|res.in|gov.in|mil.in|in)$/i;

const reKnownUrlwTLD = /([^\.\/]+\.(asia|biz|cat|coop|edu|info|eu.int|int|gov|jobs|mil|mobi|name|tel|travel|aaa.pro|aca.pro|acct.pro|avocat.pro|bar.pro|cpa.pro|jur.pro|law.pro|med.pro|eng.pro|pro|ar.com|br.com|cn.com|de.com|eu.com|gb.com|hu.com|jpn.com|kr.com|no.com|qc.com|ru.com|sa.com|se.com|uk.com|us.com|uy.com|za.com|com|ab.ca|bc.ca|mb.ca|nb.ca|nf.ca|nl.ca|ns.ca|nt.ca|nu.ca|on.ca|pe.ca|qc.ca|sk.ca|yk.ca|gc.ca|ca|gb.net|se.net|uk.net|za.net|net|ae.org|za.org|org|[^\.\/]+\.uk|act.edu.au|nsw.edu.au|nt.edu.au|qld.edu.au|sa.edu.au|tas.edu.au|vic.edu.au|wa.edu.au|act.gov.au|nt.gov.au|qld.gov.au|sa.gov.au|tas.gov.au|vic.gov.au|wa.gov.au|[^\.\/]+\.au|de|dk|tv|com.ly|net.ly|gov.ly|plc.ly|edu.ly|sch.ly|med.ly|org.ly|id.ly|ly|xn--55qx5d.hk|xn--wcvs22d.hk|xn--lcvr32d.hk|xn--mxtq1m.hk|xn--gmqw5a.hk|xn--ciqpn.hk|xn--gmq050i.hk|xn--zf0avx.hk|xn--io0a7i.hk|xn--mk0axi.hk|xn--od0alg.hk|xn--od0aq3b.hk|xn--tn0ag.hk|xn--uc0atv.hk|xn--uc0ay4a.hk|com.hk|edu.hk|gov.hk|idv.hk|net.hk|org.hk|hk|ac.cn|com.cn|edu.cn|gov.cn|net.cn|org.cn|mil.cn|xn--55qx5d.cn|xn--io0a7i.cn|xn--od0alg.cn|ah.cn|bj.cn|cq.cn|fj.cn|gd.cn|gs.cn|gz.cn|gx.cn|ha.cn|hb.cn|he.cn|hi.cn|hl.cn|hn.cn|jl.cn|js.cn|jx.cn|ln.cn|nm.cn|nx.cn|qh.cn|sc.cn|sd.cn|sh.cn|sn.cn|sx.cn|tj.cn|xj.cn|xz.cn|yn.cn|zj.cn|hk.cn|mo.cn|tw.cn|cn|edu.tw|gov.tw|mil.tw|com.tw|net.tw|org.tw|idv.tw|game.tw|ebiz.tw|club.tw|xn--zf0ao64a.tw|xn--uc0atv.tw|xn--czrw28b.tw|tw|aichi.jp|akita.jp|aomori.jp|chiba.jp|ehime.jp|fukui.jp|fukuoka.jp|fukushima.jp|gifu.jp|gunma.jp|hiroshima.jp|hokkaido.jp|hyogo.jp|ibaraki.jp|ishikawa.jp|iwate.jp|kagawa.jp|kagoshima.jp|kanagawa.jp|kawasaki.jp|kitakyushu.jp|kobe.jp|kochi.jp|kumamoto.jp|kyoto.jp|mie.jp|miyagi.jp|miyazaki.jp|nagano.jp|nagasaki.jp|nagoya.jp|nara.jp|niigata.jp|oita.jp|okayama.jp|okinawa.jp|osaka.jp|saga.jp|saitama.jp|sapporo.jp|sendai.jp|shiga.jp|shimane.jp|shizuoka.jp|tochigi.jp|tokushima.jp|tokyo.jp|tottori.jp|toyama.jp|wakayama.jp|yamagata.jp|yamaguchi.jp|yamanashi.jp|yokohama.jp|ac.jp|ad.jp|co.jp|ed.jp|go.jp|gr.jp|lg.jp|ne.jp|or.jp|jp|co.in|firm.in|net.in|org.in|gen.in|ind.in|nic.in|ac.in|edu.in|res.in|gov.in|mil.in|in))($|\/|:){1}/i;

// http://intermapper.ning.com/profiles/blogs/a-regular-expression-for-ipv6
// http://www.intermapper.com/ipv6validator
const reIPv6 =/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;

const reInvalidCharsIPv4 = /^[\.\/:]|[\+\^\?\|\*\{\}\$\s\<\>\[\]\/\\%&=;:!#~`,'"]+/i;	
const reInvalidCharsIPv6 = /^[\.\/]|[\+\^\?\|\*\{\}\$\s\<\>\[\]\/\\%&=;!#~`,'"]+/i;
const reStartWProtocol = /^[^\.\/:]+:\/\//i;
	

/*
Example for http://maps.google.com/something.html or maps.google.com, this returns google.com.
If it cannot match google.com as a known valid primary domain, it will return maps.google.com.

http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
// http://en.wikipedia.org/wiki/IPv4
// http://en.wikipedia.org/wiki/IPv6
// http://en.wikipedia.org/wiki/IPv6_address
// http://en.wikipedia.org/wiki/Localhost
// http://en.wikipedia.org/wiki/Hosts_(file)
// Contains support for localhost style names; hex, decimal, and octal forms of IPv4;
		
Examples of IPv6 in a URL (The IPv6 must be surrounded by square brackets in a valid URL, )
http://en.wikipedia.org/wiki/IPv6_address#Literal_IPv6_addresses_in_Network_Resource_Identifiers

	http://[2001:0db8:85a3:08d3:1319:8a2e:0370:7348]/
	https://[2001:0db8:85a3:08d3:1319:8a2e:0370:7348]:443/
	
Note: The expected input for currURL is a full URL with a leading protocol.
*/
const RECOGNIZE_IPV6 = false;
function getPrimaryDomain(currURL)
{
	// Sometimes websites create empty elements (empty src) and then change the src which fires another load event
	// This ensures that the empty element gets created so that the second event will fire for verification
	if (!currURL || !currURL.trim())
	{
		if (window.location.href)
			return getPrimaryDomain(window.location.href);
		else
			return null;
	}
	
	// Note: Do not use decodeURIComponent since Google Chrome automatically reformats urls formatted with that and it
	// does not recognize urls as full urls if something has been encoded with encodeURIComponent,
	// rather they are returned as urls relative to the current page.
	currURL = decodeURI(currURL).toLowerCase().trim();
	var removeExtra = currURL.match(/^([^\.\/:]+:\/\/)*([^\/])+(\/|:|$)/i);
	if (removeExtra && removeExtra.length > 0)
		currURL = removeExtra[0];
	else
		return null;
	
	// We have IPv6 here but I'm going to turn it off until IPv6 is more widespread and
	// more people are familiar with it.
	if (RECOGNIZE_IPV6)
	{
		// Try to parse currURL as an IPv6 address first 
		var splitIPv6 = currURL.match(/^([^\.\/:]+:\/\/)*([^\/:]+:[^\/:]+@)?\[([a-z0-9:\.]+)(\/[0-9]+)?\]/i);
		if (splitIPv6 && splitIPv6.length > 3 && reIPv6.test(splitIPv6[3]))
		{
			if (reInvalidCharsIPv6.test(splitIPv6[3]))
				return null;
			else
				return encodeURI(splitIPv6[3]);
		}
	}
	
	var parsedUri = parseUri(currURL);
	var parsedProtocol = parsedUri["protocol"];
	currURL = parsedUri["host"];
	if (!currURL || (parsedProtocol && reInvalidCharsIPv4.test(parsedProtocol)))
		return null;
		
	var knownForms = currURL.match(reKnownUrlwTLD);
	if (knownForms && knownForms.length > 1)
	{
		if (reInvalidCharsIPv4.test(knownForms[1]))
			return null;
		else	
			return encodeURI(knownForms[1]);
	}
	else
	{
		//currURL = decodeURI(currURL);
		var urlRemovedWWW = currURL.match(/^www\.([^\.]+\.[^\/]+)/i);	
		if (urlRemovedWWW && urlRemovedWWW.length > 1)
		{
			// Filters out the common www. in a text style url
			if (urlRemovedWWW[1].length < 4 || reInvalidCharsIPv4.test(urlRemovedWWW[1]) || reKnownTLDs.test(urlRemovedWWW[1]))
				return null;
			else		
				return encodeURI(urlRemovedWWW[1]);
		}
		else
		{
			// Some checking to see if the primary domain contains invalid characters or is a known TLD
			if (currURL < 4 || reInvalidCharsIPv4.test(currURL) || reKnownTLDs.test(currURL))
				return null;
			else
				return encodeURI(currURL);
		}
	}
}


/*
Used to determine if a url matches a urlPattern.
url: URL to be tested. This ***MUST*** have come from the output of getPrimaryDomain(..).
urlPattern: The pattern to be matched. This is highly recommended to have been generated by getPrimaryDomain(..) 
	but it can also be user supplied from the whitelist page.

Returns: Returns true if url starts with urlPattern. If urlPattern starts with a "^", then regular expression matching is used.
*/
const reSeparators = /[\.:]/i;
function patternMatches(url, urlPattern)
{
	var coreUrl = url;
	
	if (!coreUrl || !urlPattern)
		return false;
	coreUrl = coreUrl.toLowerCase();
	urlPattern = urlPattern.toLowerCase();

	// Ensure that we are not matching a "localhost" type name with something like "example.localhost"
	if (reSeparators.test(coreUrl) !== reSeparators.test(urlPattern))
		return false;
	
	var endsMatch = false;
	var matchedIndex = coreUrl.indexOf(urlPattern);		
	if (matchedIndex >= 0 && (matchedIndex + urlPattern.length) === coreUrl.length)
	   endsMatch = true;
	   
	if (!endsMatch)
	{
		matchedIndex = urlPattern.indexOf(coreUrl);		
		if (matchedIndex >= 0 && (matchedIndex + coreUrl.length) === urlPattern.length)
		   endsMatch = true;	
	}

	if (!endsMatch)
		return false;
	if (coreUrl.length === urlPattern.length)
		return true;
		
	// Check to see that we have a valid separator character where they differ
	if ((coreUrl.length > urlPattern.length && reSeparators.test(coreUrl.charAt(coreUrl.length - urlPattern.length - 1))) 
		|| (urlPattern.length > coreUrl.length && reSeparators.test(urlPattern.charAt(urlPattern.length - coreUrl.length - 1))) )
		return true;
	return false;
}

function islisted(list, url) {
	if (!list || !url)
		return false;
		
	var isOnList = false;
	
	// Need to change this to a binary search with sorted list by reverse of the strings
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
/*function fisherYatesShuffle ( array ) 
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
}*/

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

function relativeToAbsoluteUrl(url) {
    if(!url)
      return url;
		
	if (reStartWProtocol.test(url))
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
	switch (el.nodeName.toUpperCase()) 
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
	switch (el.nodeName.toUpperCase()) 
	{
		case 'SCRIPT': 
		{
			return el.src;
		}
		case 'EMBED':
		{
			// Does Google Chrome even use embeds?
			var codeBase = window.location.href;
			if (el.codeBase) codeBase = el.codeBase;
			
			if (el.src)
			{
				if (reStartWProtocol.test(el.src))
					return el.src;
				else
					return codeBase;
			}
			
			if (el.data)
			{
				if (reStartWProtocol.test(el.data))
					return el.data;
				else
					return codeBase;				
			}
			
			if (el.code)
			{
				if (reStartWProtocol.test(el.code))
					return el.code;
				else
					return codeBase;			
			}
			
			return window.location.href;
		}
		case 'IFRAME': 
		{
			return el.src;
		}
		case 'OBJECT':
		{
			var codeBase = window.location.href;
			if (el.codeBase) codeBase = el.codeBase;	
			
			// If the data attribute is given, we know the source.
			if (el.data)
			{
				if (reStartWProtocol.test(el.data))
					return el.data;
				else
					return codeBase;				
			}
			
			var plist = el.getElementsByTagName('param');
			var codeSrc = null;
			for(var i=0; i < plist.length; i++){
				var paramName = plist[i].name.toLowerCase();
				
				//console.log("Looking at param: " + plist[i].name + "    " + plist[i].value);
				
				if(paramName === 'movie' || paramName === 'src' || paramName === 'codebase' || paramName === 'data')
					return plist[i].value;
				else if (paramName === 'code' || paramName === 'url')
					codeSrc = plist[i].value;
			}
			
			if (codeSrc)
				return codeSrc;
			else
				return window.location.href;
			
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