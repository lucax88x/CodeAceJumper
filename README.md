# Code Ace Jumper

This extensions provides you with easy Ace Jump feature for Visual Studio Code. Ace Jump is fast cursor movement without touching neither the mouse nor cursor keys.

## Features

- When a key is specified, Code Ace Jumper matches each word's initial letter in the document. Words are identified by their separators (whitespaces, dots, squares, etc) which can be easily configured. Each initial letter is then marked with a unique char: by hitting a key, the cursor will be instantly moved in the corresponding position.

![](https://media.giphy.com/media/l0HlFPNndZgxEHV6w/source.gif)

## Commands

To configure the keybinding, add the following lines to `keybindings.json` (`File` -> `Preferences` -> `Keyboard Shortcuts`):

    {
        "key": "alt+enter",
        "command": "extension.aceJump"
    }

otherwise you can just open command Ace Jump

## Extension Settings

This extension contributes the following settings:

* `aceJump.placeholder.backgroundColor`: placeholder background color; defaults to yellow
* `aceJump.placeholder.color`: placeholder background color; defaults to black
* `aceJump.placeholder.border`: placeholder background color; defaults to dotted thin black
* `aceJump.finder.pattern`: regex pattern for the matching word separators; pattern should represent the single character which can split a word, for example a dot, or a square; defaults to `[ ,-.{_(\\[]`
 
### 1.0.0

Initial release
