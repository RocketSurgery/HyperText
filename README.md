# HyperText

An HTML5 game engine for creating text-based games. It is currently in development, so check back occasionally to see what's been added.



## About

The idea behind HyperText is, like Twine and TiddlyWiki before it, to simplify the work of making a non-linear story by taking most of the work in the background out of you hands, making it easier for you to focus on the writing and storytelling. However, where twine seeks to be a tool for writing non-linear stories, HyperText seeks to be a tool for designing text-based games. As such, it acts like a more cut-down, customizable, extensible version of Twine.

When making a text-based game, the last thing you want to do is put the text in your code, but writing the engine to parse text out of your source files and display it the way you want can be difficult and derail your work process. HyperText provides the basic functionality of source loading and macro parsing, which allows you to skip straight to designing your gameplay and writing your text.

## Usage

### Initialization

The engine must be initialized with a configuration before it can be used. This must be done by calling `HyperText.init(configuration)`, with `configuration` being an object with the following properties:

* `baseUrl` - the base url in which the engine will look for your story files. This is an optional attribute.
* `context` - the default context object. This is an optional attribute.
* `files` - an array containing the urls for your story files. The engine will load the files and parse the passages.
* `macros` - a list of macros to be used in parsing text. This is an optional attribute.
* `onReady` - a callback function, executed once HyperText has loaded all of its text dependencies.

All properties are required unless specified otherwise.

### Stories and Passages

Your game text is put in story files, which are given the `.sty` file extension. Story files can contain plaintext, markdown formatting, and macros, and can be broken up into passages. 

### Retrieving Passages

HyperText allows you to retrieve the parsed text of a passage as text, an HTML string, and as a DOM. You also have the option of retrieving the raw (unparsed) text of a passage, which is useful for storing text strings for menus and descriptions that don't require any macros or formatting.

### Semantic Markup

The engine uses Markdown syntax for semantic markup, plus special macros to specify engine-specific behavior. Most of the macro syntax is borrowed from the Twine syntax, so if you have familiarity with Twine this should be easy to pick up. The Markdown uses several extensions for additional functionality

* GitHub Flavoring - includes syntax for code block styling, removes hard-wrapping of paragraphs, and changes how underlines work within words. For more information, read [the article on GFM](https://help.github.com/articles/github-flavored-markdown).

### Macros

Macros are used to add special functionality to your story files, such as conditional branching and variable printing. A few basic macros are built into the engine, but the real power is the ability to add your own macro syntax, allowing you to add functionality specific to your game or story.

#### Extensions

Adding macros to HyperText is as simple as passing in an object containing your new macros to `init()`.

## Credit Where Credit is Due

### Twine/Twee

HyperText is heavily based off of Twine/Twee.

## Future Development

* Define a way to differentiate between inline linking and standalone linking. This would allow for a mix of automatic and manual links, where only the standalone links would be displayed manually.
* Allow for more than one `back` macro in a passage. This would include an optional flag which could be set to return to a single `back` macro per passage.