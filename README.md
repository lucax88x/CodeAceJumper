# Code Ace Jumper

This extensions provides you with easy Ace Jump feature for Visual Studio Code. Ace Jump is fast cursor movement without touching neither the mouse nor cursor keys.

## Features

- When a key is specified, Code Ace Jumper matches each word's initial letter in the document. Words are identified by their separators (whitespaces, dots, squares, etc) which can be easily configured. Each initial letter is then marked with a unique char: by hitting a key, the cursor will be instantly moved in the corresponding position.

![example gif](https://media.giphy.com/media/l0HlFPNndZgxEHV6w/source.gif)

## Commands

To configure the keybinding, add the following lines to `keybindings.json` (`File` -> `Preferences` -> `Keyboard Shortcuts`):

    {
        "key": "alt+enter",
        "command": "extension.aceJump"
    }

otherwise you can just open command and search for AceJump and see the available commands

## Extension Settings

This extension contributes the following settings:

- `aceJump.placeholder.backgroundColor`: placeholder background color; defaults to yellow
- `aceJump.placeholder.color`: placeholder background color; defaults to black
- `aceJump.placeholder.border`: placeholder background color; defaults to dotted thin black
- `aceJump.placeholder.width`: placeholder width; defaults to 12
- `aceJump.placeholder.height`: placeholder height; defaults to 14
- `aceJump.placeholder.fontSize`: placeholder font size; defaults to 14
- `aceJump.placeholder.textPosX`: placeholder text X position; defaults to 2
- `aceJump.placeholder.textPosY`: placeholder text Y position; defaults to 12
- `aceJump.placeholder.fontWeight`: placeholder font weight; defaults to normal
- `aceJump.placeholder.fontFamily`: placeholder font family; defaults to Consolas
- `aceJump.placeholder.upperCase`: placeholder font to uppercase; defaults to false
- `aceJump.finder.pattern`: regex pattern for the matching word separators; pattern should represent the single character which can split a word, for example a dot, or a square; defaults to `[ ,-.{_(\\[]`
- `aceJump.finder.skipSelection`: don't acejump in selections
- `aceJump.finder.onlyInitialLetter`: if enabled, will search for starting character of the words, otherwise it will search for any characters (this also mean special characters, don't try space :D)

### 1.0.0

Initial release

### 1.1.0

New group system when we have more matches than the alphabet can have (26) [details](https://github.com/lucax88x/CodeAceJumper/issues/6)

### 1.1.1

using SVG instead of TEXT for the decorations, this means a HUGE performance boost

### 1.1.2

thanks to [ncthis](https://github.com/lucax88x/CodeAceJumper/pull/8) we now are able to make ace jump placeholders only for a "range" where the cursor is, instead of full page. Genius workaround until vscode releases the APIs for getting only viewable area of the screen.

### 1.1.3

placeholder now have more configurations, such has font size, family, etc
added ', " and < in the pattern

### 1.1.4

- Added new command that let Ace Jump [details](https://github.com/lucax88x/CodeAceJumper/issues/6)
- Correctly disposing the `AceJump: Type` and `AceJump: Jump To messages`

### 1.1.5

- possibility to search inside words using the new setting `aceJump.finder.onlyInitialLetter=false`
- possibility to skip the search on the selections using the new setting `aceJump.finder.skipSelection=true`

### 1.1.6

- Resolve non-intuitive behavior when search query matches separator regex [details](https://github.com/lucax88x/CodeAceJumper/pull/20)

### 1.1.7

- Fixed "AceJump: Jump To" message always in status bar #18 [details](https://github.com/lucax88x/CodeAceJumper/issues/18)

### 1.1.8

- Now the icon does not move the charaters in vscode anymore #23 [details](https://github.com/lucax88x/CodeAceJumper/issues/23)

### 1.1.9

- Now uses a new vscode api for detecing the visible ranges in the screen [details](https://github.com/lucax88x/CodeAceJumper/issues/5)

### 1.1.10

- Now should work together with extensions using the TYPE command (like VIM extensions) thanks to [matklad](https://github.com/lucax88x/CodeAceJumper/pull/25)
