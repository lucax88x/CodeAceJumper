# Code Ace Jumper

This extensions provides you with easy Ace Jump feature for Visual Studio Code. Ace Jump is fast cursor movement without touching neither the mouse nor cursor keys.

## Commands

- `extension.aceJump` when a key is specified, Code Ace Jumper matches each word's initial letter in the document. Words are identified by their separators (whitespaces, dots, squares, etc) which can be easily configured. Each initial letter is then marked with a unique char: by hitting a key, the cursor will be instantly moved in the corresponding position.

![example gif](https://media.giphy.com/media/l0HlFPNndZgxEHV6w/source.gif)

- `extension.aceJump.multiChar` allows us to refine the placeholders by providing more characters. When one matches it automatically jumps, otherwise you can escape and then jump by matching remaining placeholders.

![example gif](https://media.giphy.com/media/IzubTB1OPhaMUckWZb/giphy.gif)

- `extension.aceJump.selection` allows us to refine the placeholders by providing more characters. When one matches it automatically jumps, otherwise you can escape and then jump by matching remaining placeholders.

## Keyboard shortcuts

You may set keyboard shortcuts for invoking Code Ace Jumper by entering values in the keybindings.json file. For example:

```json
{
    "key": "your key",
    "command": "extension.aceJump"
},
{
    "key": "your key",
    "command": "extension.aceJump.multiChar"
},
{
    "key": "your key",
    "command": "extension.aceJump.selection"
}
```

Alternatively, you can set shortcuts using Code's own keyboard shortcuts GUI.

## Advanced visual configuration for the placeholder

Code Ace Jumper is preset with sensible visual defaults. You can further configure the aesthetics of the placeholders shown by adjusting the following settings in your settings.json file:

```json
aceJump.placeholder.backgroundColor: placeholder background color; defaults to #c0b18b
aceJump.placeholder.color: placeholder width; defaults to #333
aceJump.placeholder.upperCase: placeholder font to uppercase; defaults to false
aceJump.placeholder.border: placeholder border; defaults to none
aceJump.placeholder.fontWeight: placeholder font weight; defaults to 500
```
