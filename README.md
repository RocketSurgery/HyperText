# HyperText

An HTML5 game engine for creating text-based games. It is currently in development, so check back occasionally to see what's been added.

## About

The idea behind HyperText is, like Twine and TiddlyWiki before it, to simplify the work of making a non-linear story by taking most of the work in the background out of you hands, making it easier for you to focus on the writing and storytelling. However, HyperText seeks to expand on the Twine model by creating a more customizable, extensible, game-oriented engine.

## Usage

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

### Syntax

All macros are wrapped in double angle-braces, and are started with a command, such as `scene`, `print`, or `if`. Macros may include variables, which are denoted by a preceding `$` character.

#### Scenes

Scenes are declared with the `scene` macro. They are given an identifying name, which must be formatted in the same way as javascript variable names, and must be unique for your entire game structure.

`<<scene sceneName>>`

Scenes can be dynamically displayed with the `print` macro.

`<<print sceneName>>` - displays the contents of a scene.

#### Variables

You can define, manipulate, and print variables using macros.

* `<<define $variable = value>>` - dynamically defines $variable, assigning an initial value is optional.
* `<<$variable += $stuff>>` - if no macro command is provided, the content within the macro is simply executed as normal. In this case, the value of $stuff would be added to $variable. 
* `<<print $variable>>` - replaces macro with value of $variable.

For more complex variable usage, you can provide the engine with an object containing your variables through the `init()` function. You can use this to create more complex variable structures, such as your own classes. For example say you have a 'Character' class, which has a 'name' value. If you have a variable $player which is an instance of 'Character', you could print out the player's name with `<<print $player.name>>`.

### Conditionals

Conditional blocks only display the contained text if their conditions evaluate to true. Conditional block must open with the `if` macro and close with `endif`, and may contain any combination of `elseif` and `else` macros, so long as the `else` macro directly precedes the `endif` macro.

* `<<if $condition>>...<<endif>>`
* `<<if $condition>>...<<else>>...<<endif>>`
* `<<if $condition>>...<<elseif $otherCondition>>...<<endif>>`

Standard javascript comparison operations can be used in your conditionals to compare values.

* `<<if $val == $other>>`
* `<<if $val > $other>>`
* `<<if ($val || $other) && $something>>`
* `<<if ($val or $other) and $something>>`

### Functions and Scripting

You can also make function calls using macros, as well as writing javascript from within your story files. It is recommended that you do not do this extensively, as the engine has better methods for doing advanced scripting, but the option is available.

* `<<$function()>>` - functions are denoted with the same `$` character as variables, but they are followed with round braces which contain the list of parameters.
* `<<script>>...<<endscript>>` - javascript code can be included in blocks denoted by the `script` macro. Close blocks with the `endscript` macro. 

## Credit Where Credit is Due

### Twine/Twee

HyperText is heavily based off of Twine/Twee.

## API Details

This is a temporary holding place for the API notes while the engine is in development.

### Dependencies

HyperText requires jQuery, which you can load globally or with your favorite dependency-loading library.

### TextEngine class

In order to avoid polluting the global namespace, all of the engine's functionality is wrapped up in the `TextEngine` class.

### Initialization

The engine must be initialized with a configuration before it can be used. This must be done by calling `TextEngine.init(configuration)`, with `configuration` being an object with the following properties:

* `baseUrl` - the base url for your story files. This is an optional attribute.
* `variables` - an object containing any additional variables you would like to reference in your macros.
* `start` - the url for the file containing the 'Start' scene. This scene will be loaded synchronously and will be available for display while the other resources are loaded.
* `files` - an array containing the urls for your story files. The engine will load the files and parse the scenes.
* `linkHandling` - either `"automatic"` or `"manual"`. Automatic handling requires that you provide a value for `display`, and the engine will automatically follow links and change what text is displayed, a la Twine. If no value is provided, the engine will default to manual handling, and will require a link handler.
* `linkHandler` - if you are manually handling links, you must provide the function which will be called when a link is clicked.
* `display` - the DOM object you want to use as the wrapper for you game's output. This is used primarily for allowing the engine to automatically display your scenes.

All properties are required unless specified otherwise.

### Scene

The `TextEngine.Scene` class contains all of the information for your various scenes. Scenes are identified by a unique identifier provided in their declaring macro.
