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

### Displaying Scenes

To display a scene you call `HyperText.display(sceneId [, outputLoc])`. If you provided a default output location during initialization, that will be the location provided, otherwise you can provide and output location for the text.

### Stories and Scenes

Your game text is put in story files, which are given the `.sty` file extension. Story files can contain plaintext, markdown formatting, and macros, and can be broken up into scenes. 

#### Example

```markdown
<<scene someScene>>
This is a scene, it contains text and stuff. Stuff can happen.

<<scene anotherScene>>
This is another scene within the same file. More stuff can happen.

Yaaaaaayyyyyyyy.
```

### Syntax

The engine uses Markdown syntax for semantic markup, plus special macros to specify engine-specific behavior. Most of the macro syntax is borrowed from the Twine syntax, so if you have familiarity with Twine this should be easy to pick up. The Markdown uses several extensions for additional functionality

* GitHub Flavoring - includes syntax for code block styling, removes hard-wrapping of paragraphs, and changes how underlines work within words. For more information, read [the article on GFM](https://help.github.com/articles/github-flavored-markdown).

### Macros

#### Syntax

All macros are wrapped in double angle-braces, and are started with a command, such as `scene`, `print`, or `if`. Macros may include variables, which are denoted by a preceding `$` character.

#### Scenes

Scenes are declared with the `scene` macro. They are given an identifying name, which must be formatted in the same way as javascript variable names, and must be unique for your entire game structure.

`<<scene sceneName>>`

Scenes can be dynamically displayed with the `print` macro.

`<<print sceneName>>` - displays the contents of a scene.

#### Variables

You can define, manipulate, and print variables using macros.

* `<<define $variable = value>>` - dynamically defines $variable, assigning an initial value is optional.
* `<<delete $variable>>` - the delete command will allow you to clear a variable, allowing you to define it again.
* `<< $variable += $stuff >>` - if no macro command is provided, the content within the macro is simply executed as script. In this case, the value of $stuff would be added to $variable. NOTE: you must leave a space after the `<<` otherwise the engine will be angry with you.

For more complex variable usage, you can provide the engine with an object containing your variables through the `init()` function. You can use this to create more complex variable structures, such as your own classes. For example say you have a 'Character' class, which has a 'name' value. If you have a variable $player which is an instance of 'Character', you could print out the player's name with `<<print $player.name>>`.

#### Printing

You can dynamically print variables and scenes using the `print` macro.

* `<<print $variable>>` - print out the value of a variable.
* `<<print scene>>` - print out the text of a scene. Useful for dynamically displaying large chunks of text.

#### Linking

You can link between scenes, as well as track to the previous canonical page.

The behavior behavior for link handling depends on whether you are using automatic or manual link handling. Automatic handling will cause the engine to behave similarly to twine, in that it will display the link as a hypertext link. Manual link handling allows you to choose how the link gets displayed by providing you a list of links on the page and allowing you to display them how you want (this is useful if you want to display your links in a row of buttons, rather than with the text).

Manual link handling requires you to provide a callback method, which must in turn call `HyperText.linkHandler(e)` in order to display the new scene. The callback method is used primarily to allow you to display the links in a scene outside of the display frame.

* `<<link sceneName>>` - creates a link to sceneName, with text "sceneName".
* `<<link sceneName stuff to display>>` - creates a link to sceneName with text "stuff to display".
* `<<back>>` - creates a link to the last canonical page.

#### Conditionals

Conditional blocks only display the contained text if their conditions evaluate to true. Conditional block must open with the `if` macro and close with `endif`, and may contain any combination of `elseif` and `else` macros, so long as the `else` macro directly precedes the `endif` macro.

* `<<if $condition>>...<<endif>>`
* `<<if $condition>>...<<else>>...<<endif>>`
* `<<if $condition>>...<<elseif $otherCondition>>...<<endif>>`

Standard javascript comparison operations can be used in your conditionals to compare values.

* `<<if $val == $other>>`
* `<<if $val > $other>>`
* `<<if ($val || $other) && $something>>`

### Functions and Scripting

You can also make function calls using macros, as well as writing javascript from within your story files. It is recommended that you do not do this extensively, as the engine has better methods for doing advanced scripting, but the option is available.

* `<<$function()>>` - functions are denoted with the same `$` character as variables, but they are followed with round braces which contain the list of parameters.
* `<<script>>...<<endscript>>` - javascript code can be included in blocks denoted by the `script` macro. Close blocks with the `endscript` macro. 

## Credit Where Credit is Due

### Twine/Twee

HyperText is heavily based off of Twine/Twee.

## API Details

This is a temporary holding place for the API notes while the engine is in development.

### Text Parsing and Output

When a scene needs to be displayed, `parseSceneAndOutputText(sceneText)` is called. This method takes in the scene rawtext and parses out the macros, pushing the parsed rawtext to an output function. The parsing function, when it finds a macro it passes the macro and a parser object, which contains the source text and the parser's current position in the text.

The macros variable contains an object for each of the macro commands, each of which has a `handler` function. This function will output the appropriate text for the macro and, if necessary, push the parser cursor forward to bypass the rest of the macro (as in the case of if-endif macro pairs, where the parser must move past the entire macro set).

## Future Development

* Define a way to differentiate between inline linking and standalone linking. This would allow for a mix of automatic and manual links, where only the standalone links would be displayed manually.
* Allow for more than one `back` macro in a scene. This would include an optional flag which could be set to return to a single `back` macro per scene.