# Code Ace Jumper

This extensions provides you easy Ace Jump (aka fast cursor movement without touching mouse) functions for your Visual Studio Code

## Features

- Ace jumps to all matching initial letter on all the word on the document (a word can be separated by whitespaces, dot, squares, etc [configurable])

![](https://media.giphy.com/media/l0HlFPNndZgxEHV6w/source.gif)

## Commands

To set up the a keybinding, add the following to your keybindings.json (File -> Preferences -> Keyboard Shortcuts):

    {
        "key": "alt+enter",
        "command": "extension.aceJump"
    }

otherwise you can just open command Ace Jump

## Extension Settings

This extension contributes the following settings:

* `aceJump.placeholder.backgroundColor`: placeholder background color, defaults to yellow
* `aceJump.placeholder.color`: placeholder background color, defaults to black
* `aceJump.placeholder.border`: placeholder background color, defaults to dotted thin black
* `aceJump.finder.pattern`: regex pattern for the findings, pattern should be only 1 character which can split a word, for example a dot, or a square, defaults to [ ,-.{_(\\[]
 
### 1.0.0

Initial release