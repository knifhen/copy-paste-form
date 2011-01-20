var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

var valueCache = {};
var keyCache = new Array();

var validElementTypes = {};
validElementTypes['text'] = true;
validElementTypes['radio'] = true;
validElementTypes['select-one'] = true;
validElementTypes['checkbox'] = true;
validElementTypes['password'] = true;
validElementTypes['textarea'] = true;

if(!prefs.getBoolPref('copypasteform.enableAdvancedMenu')) {
	createCss('.copyPasteFormClass', 'display:none');
}

function createCss(selector, declaration) {
	document.styleSheets[0].insertRule(selector + '{' + declaration + '}', document.styleSheets[0].cssRules.length);
}

function writeCacheToDisk() {
	var cacheAsString = "";
	for(var keyI = 0; keyI < keyCache.length; keyI++) {
		cacheAsString = cacheAsString.concat(keyCache[keyI] + "=" + valueCache[keyCache[keyI]] + "\n");
	}
	writeToFile(prefs.getCharPref('copypasteform.selectedForm'), cacheAsString);
}

function readCacheFromDisk() {
    clearCaches();
	var cacheEntries = readFromFile(prefs.getCharPref('copypasteform.selectedForm'));
	for(var cacheEntryI = 0; cacheEntryI < cacheEntries.length; cacheEntryI++) {
	   var tokens = cacheEntries[cacheEntryI].split("=");
	   valueCache[tokens[0]] = tokens[1];
	   keyCache[keyCache.length] = tokens[0];
	}
}

function clearCaches() {
	valueCache = {};
	keyCache = new Array();
}

function setCachedValue(key, value) {
	valueCache[key] = escape(value);
	keyCache[keyCache.length] = key;
}

function getCachedValue(key) {
	return unescape(valueCache[key]);
}

function cachedValueExists(key) {
	return valueCache[key] != undefined;
}


function selectOption(element, value) {
	var options = element.options;
	for(var optionI = 0; optionI < options.length; optionI++) {
		if(options[optionI].text == value) {
			element.selectedIndex = optionI;
			return true;
		}
	}
	return false;
}

function getSelectedOption(element) {
	var options = element.options;
	for(var optionI = 0; optionI < options.length; optionI++) {
		if(options[optionI].selected) {
			return options[optionI].text;
		}
	}
}

function markElementAsFailedToLoad(element) {
	if(prefs.getBoolPref('copypasteform.enableFeedback')) {
		element.style.outlineColor = 'Red';
		element.style.outlineWidth = '2';
		element.style.outlineStyle = 'solid';
	}
}

function markElementAsNotLoaded(element) {
	if(prefs.getBoolPref('copypasteform.enableFeedback')) {
		element.style.outlineColor = 'Yellow';
		element.style.outlineWidth = '2';
		element.style.outlineStyle = 'solid';
	}
}

function unmarkElement(element) {
	element.style.outline = '';
}

function isValidElement(element) {
	return validElementTypes[element.type] != undefined;
}

function saveValue(element) {
	if(element.type == 'radio' || element.type == 'checkbox') {
		setCachedValue(element.name + '.' + element.value , element.checked.toString());
	} else if(element.type == 'select-one') {
		setCachedValue(element.name, getSelectedOption(element));
	} else {
		setCachedValue(element.name, element.value);
	}
}

function loadValue(element) {
	var valueLoaded = false;
	var valueFailedToLoad = false;
	
	if(element.type == 'radio' || element.type == 'checkbox') {
		if(cachedValueExists(element.name + '.' + element.value)) {
			element.checked = "true" == getCachedValue(element.name+ '.' + element.value);
			valueLoaded = true;
		}
	} else if(element.type == 'select-one') {
		if(cachedValueExists(element.name)) {
			if(!selectOption(element, getCachedValue(element.name))) {
				markElementAsFailedToLoad(element);
				valueFailedToLoad = true;
			} else {
				valueLoaded = true;
			}
		}
	} else {
		if(cachedValueExists(element.name)) {
			element.value = getCachedValue(element.name);
			valueLoaded = true;
		}
	}
	
	if(valueFailedToLoad) {
		markElementAsFailedToLoad(element);
	} else if(!valueLoaded) {
		markElementAsNotLoaded(element);
	} else {
		unmarkElement(element);
	}
}

function saveFormData(doc){
	for(var formI = 0; formI < doc.forms.length; formI++) {
		var form = doc.forms[formI];
		for(var elementI = 0; elementI < form.length; elementI++) {
			var element = form.elements[elementI];
			if(isValidElement(element)) {
				saveValue(element);
			}
		}
	}
}

function loadFormData(doc){
	for(var formI = 0; formI < doc.forms.length; formI++) {
		var form = doc.forms[formI];
		for(var elementI = 0; elementI < form.length; elementI++) {
			var element = form.elements[elementI];
			if(isValidElement(element)) {
				loadValue(element);
			}
		}
	}
}

function getAllDocuments(doc) {
	var documents = new Array();
	documents[documents.length] = doc;
	var frames = doc.getElementsByTagName('frame');
	for(var frameI = 0; frameI < frames.length; frameI++) {
		var subDocuments = getAllDocuments(frames[frameI].contentDocument);
		for(var documentI = 0; documentI < subDocuments.length; documentI++) {
			documents[documents.length] = subDocuments[documentI];
		}
	}
	return documents;
}

function copyForm(e) {
	clearCaches();
	var documents = getAllDocuments(content.document);
	for(var documentI = 0; documentI < documents.length; documentI++) {
		saveFormData(documents[documentI]);
	}
	if(prefs.getBoolPref('copypasteform.enableCacheToDisk')) {
		writeCacheToDisk();
	}
}

function pasteForm(e) {
	if(prefs.getBoolPref('copypasteform.enableCacheToDisk')) {
		readCacheFromDisk();
	}
	var documents = getAllDocuments(content.document);
	for(var documentI = 0; documentI < documents.length; documentI++) {
		loadFormData(documents[documentI]);
	}
}

function addForm(e) {
	var left = e.screenX - 50, top = e.screenY - 50;
	window.openDialog("chrome://copypasteform/chrome/addFormDialog.xul", "",
    "chrome, dialog, modal, titlebar=no, close=no, resizable=yes, left=" + left + "px, top=" + top + "px");
}

function openForm(e, formName) {
	var left = e.screenX - 50, top = e.screenY - 50;
	window.openDialog("chrome://copypasteform/chrome/" + formName, "",
    "chrome, dialog, modal, titlebar=no, close=no, resizable=yes, left=" + left + "px, top=" + top + "px");
}

function updateSelectedForm(formName) {
	prefs.setCharPref('copypasteform.selectedForm', formName);
}

function loadForms(e) {
	var files = listFiles();
	
	var parent = $('copyPasteFormMenuPopup');
	
	var forms = $H({});
	
	for(var i = 0; i < files.length; i++) {
		forms[files[i]] = files[i];
	}
	
	for(var i = parent.childNodes.length - 1; i >= 0; i--) {
		var id = parent.childNodes[i].id;
		if(id != 'addForm' && id != 'copypasteformSeparator1' && id != 'delForm') {
			if(forms.keys().indexOf(id) == -1) {
				parent.removeChild(parent.childNodes[i]);
			} else {
				forms.remove(id);
				if(prefs.getCharPref('copypasteform.selectedForm') == id) {
					parent.childNodes[i].setAttribute("checked", true);
				}
			}
		}
	}

	for(var i = 0; i < forms.keys().length; i++) {
		var element = document.createElement("menuitem");
		element.setAttribute("label", forms.keys()[i]);
		element.setAttribute("id", forms.keys()[i]);
		element.setAttribute("name", 'form');
		element.setAttribute("type", 'radio');
		if(prefs.getCharPref('copypasteform.selectedForm') == forms.keys()[i]) {
			element.setAttribute("checked", true);
		}
		element.setAttribute("onclick", 'updateSelectedForm(\'' + forms.keys()[i] + '\');');
		parent.appendChild(element);
	}
}	