#TextEngine

An HTML5 game engine for creating text-based games. It is currently in development, so check back occasionally to see what's been added.

##Config

The configuration of the engine must be established before any of the engine's functionality can be used. This can be done by calling `TextEngine.config(configuration)`, with `configuration` being an object with the following properties:

* `variables` - an object containing all the values referenced in your scene texts. All referenced variables must be defined or unpredictable behavior will result.
* `baseUrl` - the base url for your story files. This is an optional attribute.
* `files` - an array containing the urls for your story files. The engine will load the files and parse the scenes.

All properties are required unless specified otherwise.

##Syntax

The engine uses standard markdown with a few additional pieces of syntax to denote engine-specific elements.

* `{{(sceneName)` - scene opener. This goes at the beginning of a scene, with the name of the scene between the parentheses. This must be matched with a scene closer.
* `}}` - scene closer. This goes at the end of the markdown for a scene. Must be matched with a scene opener.
* `<<variableName>>` - the name of a variable. The object containing the variables you want to use must be passed in with config().