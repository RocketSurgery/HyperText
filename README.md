#TextEngine

An HTML5 game engine for creating text-based games. It is currently in development, so check back occasionally to see what's been added.

##Functionality

* Load text from external file and display it.
* Save and Load files
* Include variables in story files.
* Include conditionals in story files.
* XML Schema for validation of manifest and story files.

##Design Details
* There is a central manifest.xml which contains a list of all the story files. Files must be kept in the “text” directory, and any number of sub-directories can be added as long as the manifest contains the full path the the story file.
