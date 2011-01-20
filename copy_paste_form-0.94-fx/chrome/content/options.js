var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

function onLoad() {
    document.getElementById("enableFeedBack").checked = prefs.getBoolPref("copypasteform.enableFeedback");
	document.getElementById("enableCacheToDisk").checked = prefs.getBoolPref("copypasteform.enableCacheToDisk");
	document.getElementById("enableAdvancedMenu").checked = prefs.getBoolPref("copypasteform.enableAdvancedMenu");
}

function savePreferences(window) {
	prefs.setBoolPref("copypasteform.enableFeedback", document.getElementById("enableFeedBack").checked);
	prefs.setBoolPref("copypasteform.enableCacheToDisk", document.getElementById("enableCacheToDisk").checked);
	prefs.setBoolPref("copypasteform.enableAdvancedMenu", document.getElementById("enableAdvancedMenu").checked);
	window.close();
}