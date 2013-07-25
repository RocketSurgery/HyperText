# HyperText

An HTML5 game engine for creating text-based games. It is currently in development, so check back occasionally to see what's been added.



## About

The idea behind HyperText is, like Twine and TiddlyWiki before it, to simplify the work of making a non-linear story by taking most of the work in the background out of you hands, making it easier for you to focus on the writing and storytelling. However, where twine seeks to be a tool for writing non-linear stories, HyperText seeks to be a tool for designing text-based games. As such, it acts like a more cut-down, customizable, extensible version of Twine.

When making a text-based game, the last thing you want to do is put the text in your code, but writing the engine to parse text out of your source files and display it the way you want can be difficult and derail your work process. HyperText provides the basic functionality of source loading and macro parsing, which allows you to skip straight to designing your gameplay and writing your text.

## Usage

### Initialization

The engine must be initialized with a configuration before it can be used. This must be done by calling `HyperText.init(configuration)`, with `configuration` being an object with the following properties:

* `baseUrl` - the base url for your story files. This is an optional attribute.
* `variables` - an object containing any additional variables you would like to reference in your macros.
* `start` - the url for the file containing the 'Start' scene. This scene will be loaded synchronously and will be available for display while the other resources are loaded.
* `files` - an array containing the urls for your story files. The engine will load the files and parse the scenes.
* `linkHandling` - either `"automatic"` or `"manual"`. Automatic handling requires that you provide a value for `display`, and the engine will automatically follow links and change what text is displayed, a la Twine. If no value is provided, the engine will default to manual handling, and will require a link handler.
* `linkHandler` - if you are manually handling links, you must provide the function which will be called when a link is clicked.
* `display` - the DOM object you want to use as the wrapper for you game's output. This is used primarily for allowing the engine to automatically display your scenes.

All properties are required unless specified otherwise.

### Stories and Scenes

Your game text is put in story files, which are given the `.sty` file extension. Story files can contain plaintext, markdown formatting, and macros, and can be broken up into scenes. 

### Displaying Scenes

To display a scene you call `HyperText.display(sceneId [, outputLoc])`. If you provided a default output location during initialization, that will be the location provided, otherwise you can provide and output location for the text.


### Semantic Markup

The engine uses Markdown syntax for semantic markup, plus special macros to specify engine-specific behavior. Most of the macro syntax is borrowed from the Twine syntax, so if you have familiarity with Twine this should be easy to pick up. The Markdown uses several extensions for additional functionality

* GitHub Flavoring - includes syntax for code block styling, removes hard-wrapping of paragraphs, and changes how underlines work within words. For more information, read [the article on GFM](https://help.github.com/articles/github-flavored-markdown).

### Macros

Macros are used to add special functionality to your story files, such as conditional branching and variable printing. A few basic macros are built into the engine, but the real power is the ability to add your own macro syntax, allowing you to add functionality specific to your game or story.

## Credit Where Credit is Due

### Twine/Twee

HyperText is heavily based off of Twine/Twee.

## Future Development

* Define a way to differentiate between inline linking and standalone linking. This would allow for a mix of automatic and manual links, where only the standalone links would be displayed manually.
* Allow for more than one `back` macro in a scene. This would include an optional flag which could be set to return to a single `back` macro per scene.