# Code Ace Jumper

This extensions provides you with easy Ace Jump feature for Visual Studio Code. Ace Jump is fast cursor movement without touching neither the mouse nor cursor keys.

## Commands

- `extension.aceJump` when a key is specified, Code Ace Jumper matches each word's initial letter in the document. Words are identified by their separators (whitespaces, dots, squares, etc) which can be easily configured. Each initial letter is then marked with a unique char: by hitting a key, the cursor will be instantly moved in the corresponding position.

![example gif](https://media.giphy.com/media/l0HlFPNndZgxEHV6w/source.gif)

- `extension.aceJump.multiChar` allows us to refine the placeholders by providing more characters. When one matches it automatically jumps, otherwise you can escape and then jump by matching remaining placeholders.

![example gif](https://user-images.githubusercontent.com/2300328/53043799-17ad7e80-3468-11e9-993e-9d425a9801e8.gif)

## Keyboard shortcuts
You may set keyboard shortcuts for invoking Code Ace Jumper by entering values in the keybindings.json file. For example:

```json
{
    "key": "ctrl+alt+cmd+space",
    "command": "extension.aceJump"
},
{
    "key": "ctrl+cmd+space",
    "command": "extension.aceJump.selection"
}
```

Alternatively, you can set shortcuts using Code's own keyboard shortcuts GUI.

## Advanced visual configuration for the placeholder
Code Ace Jumper is preset with sensible visual defaults. You can further configure the aesthetics of the placeholders shown by adjusting the following settings in your settings.json file:

```json
aceJump.placeholder.width: placeholder width; defaults to 12
aceJump.placeholder.height: placeholder height; defaults to 14
aceJump.placeholder.fontSize: placeholder font size; defaults to 14
aceJump.placeholder.textPosX: placeholder text X position; defaults to 2
aceJump.placeholder.textPosY: placeholder text Y position; defaults to 12
aceJump.placeholder.fontWeight: placeholder font weight; defaults to normal
aceJump.placeholder.fontFamily: placeholder font family; defaults to Consolas
aceJump.placeholder.upperCase: placeholder font to uppercase; defaults to false
```

__Note__ that the placeholder is an SVG asset so amending the font and size, for example, will require you to also amend the X/Y text positions.