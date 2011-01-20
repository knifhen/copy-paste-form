var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

function saveForm() {
	var formName = $('formName').value;
	var tokens = formName.split(' ');
	if(tokens.length == 1) {
		writeToFile(formName, '', true);
	}
	
	return true;
}

function loadDelForm() {
	var parent = $('delGroup');
	var files = listFiles();
	for(var i = 0; i < files.length; i++) {
		if(files[i] != 'default') {
			var element = document.createElement("checkbox");
			element.setAttribute("label", files[i]);
			element.setAttribute("id", files[i]);
			element.setAttribute("class", "deleteForm");
			parent.appendChild(element);
		}
	}
}

function deleteFiles() {
	var forms = document.getElementsByClassName('deleteForm');
	for(var i = 0; i < forms.length; i++) {
		if(forms[i].checked) {
			if(removeFile(forms[i].label) && prefs.getCharPref('copypasteform.selectedForm') == forms[i].label) {
				prefs.setCharPref('copypasteform.selectedForm', 'default');
			}
		}
	}
	return true;
}