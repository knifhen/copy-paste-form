function getRootDir() {
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService(Components.interfaces.nsIProperties)
	                     .get("ProfD", Components.interfaces.nsIFile);
	file.append("extensions");
	file.append("{787bbe79-5e9e-4c84-bb32-8fca8b45d512}");
	file.append("copyPasteForm");
	
	return file;
}

function listFiles() {
	var file = getRootDir();

	// file is the given directory (nsIFile)
	var entries = file.directoryEntries;
	var array = [];
	while(entries.hasMoreElements())
	{
	  var entry = entries.getNext();
	  entry.QueryInterface(Components.interfaces.nsIFile);
	  array.push(entry.leafName);
	}
	return array;
}

function writeToFile(fileName, content) {
	//Writing a textfile
	var file = getRootDir();
	//Create the rootDir if missing.
	if(!file.exists()) {
		file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	}
	file.append(fileName);
	//Create the file if missing.
	if(!file.exists()) {
		file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0600);
	}
	var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"] .createInstance(Components.interfaces.nsIFileOutputStream);
	var writeMode = 0x02 | 0x08 | 0x20;
	stream.init(file, writeMode, 0666, 0); // write, create, truncate
	stream.write(content, content.length);
	if (stream instanceof Components.interfaces.nsISafeOutputStream) { 
		stream.finish(); 
	} else { 
		stream.close(); 
	}
}

function readFromFile(fileName) {
	// open an input stream from file
	var line = {}, lines = [], hasmore;
	var file = getRootDir();
	file.append(fileName);
	if(file.exists()) {
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
		                        .createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(file, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		// read lines into a string
		do {
		  hasmore = istream.readLine(line);
		  if(lines.length > 0) {
			lines.push(line.value);
		  }
		  lines = lines.concat(line.value);
		} while(hasmore);

		istream.close();
	}
	return lines;
}

function removeFile(fileName) {
	var file = getRootDir();
	file.append(fileName);
	if(file.exists()) {
		file.remove(false);
		return true;
	}
	return false;
}