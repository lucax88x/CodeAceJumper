import * as vscode from 'vscode';
import * as path from 'path';
import * as _ from "lodash";

export class PlaceHolder {
    index: number;
    placeholder: string;
    line: number;
    character: number;
}

export class AceJump {

    characters: string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    // characters: string[] = ["A", "B", "C"]
    preparedCharacters: string[] = [];
    placeholders: PlaceHolder[];

    decorations: vscode.TextEditorDecorationType[] = [];

    constructor() {

        let firstLevel: string[] = [];
        let secondLevel: string[] = [];
        let thirdLevel: string[] = [];

        for (let i = 0; i < this.characters.length; i++) {
            firstLevel.push(this.characters[i]);
            for (let y = 0; y < this.characters.length; y++) {
                secondLevel.push(this.characters[i] + this.characters[y]);
                for (let z = 0; z < this.characters.length; z++) {
                    thirdLevel.push(this.characters[i] + this.characters[y] + this.characters[z]);
                }
            }
        }
        this.preparedCharacters = this.preparedCharacters.concat(firstLevel, secondLevel, thirdLevel)
    }

    configure = (context: vscode.ExtensionContext) => {

        let disposables: vscode.Disposable[] = [];

        disposables.push(vscode.commands.registerCommand('extension.aceJump', () => {
            this.jump();
        }));

        for (let i = 0; i < disposables.length; i++) {
            context.subscriptions.push(disposables[i]);
        }
    }

    jump = () => {
        this.placeholders = [];

        let editor = vscode.window.activeTextEditor;

        if (!editor) {
            return; // No open text editor
        }

        let textToCheck: string;
        let startLine: number;
        let lastLine: number;

        if (!editor.selection.isEmpty) {
            textToCheck = editor.document.getText(editor.selection);

            if (editor.selection.anchor.line > editor.selection.active.line) {
                startLine = editor.selection.active.line;
                lastLine = editor.selection.anchor.line;
            }
            else {
                startLine = editor.selection.anchor.line;
                lastLine = editor.selection.active.line;
            }
        }
        else {
            textToCheck = editor.document.getText();

            startLine = 0;
            lastLine = editor.document.lineCount;
        }

        vscode.window.showInputBox({
            prompt: "type letter",
            ignoreFocusOut: true,
            validateInput: (value: string) => {

                if (value && value.length > 1)
                    return "only one char";

                if (textToCheck.indexOf(value) === -1)
                    return "this is missing";

                return "";
            }
        })
            .then((value: string) => {

                if (!value) return;

                if (value && value.length > 1)
                    value = value.substring(0, 1);

                let lineIndexes: { [key: number]: number[]; } = {};

                for (let i = startLine; i < lastLine; i++) {
                    let line = editor.document.lineAt(i);
                    lineIndexes[i] = this.indexesOf(line.text, value);
                }

                let brokeCycle: boolean = false;
                _.forOwn<number[]>(lineIndexes, (lineIndex, key) => {
                    let line = parseInt(key);

                    _.each(lineIndex, (character) => {
                        let placeholder = this.nextPlaceholder(_.last(this.placeholders));

                        placeholder.line = line;
                        placeholder.character = character;

                        if (placeholder.index >= this.preparedCharacters.length) {
                            brokeCycle = true;
                            return false;
                        }

                        this.placeholders.push(placeholder);
                    });

                    if (brokeCycle)
                        return false;
                });

                if (this.placeholders.length === 0) return;
                if (this.placeholders.length === 1) {
                    let placeholder = _.first(this.placeholders);
                    this.setSelection(editor, placeholder);
                }
                else {

                    _.each(this.placeholders, (placeholder) => {
                        this.addDecoration(editor, placeholder.placeholder, new vscode.Range(placeholder.line, placeholder.character, placeholder.line, placeholder.character + 1));
                    })

                    vscode.window.showInputBox({
                        ignoreFocusOut: true,
                        prompt: "ace jump to",
                        validateInput: (value: string) => {

                            if (!_.find(this.placeholders, placeholder => placeholder.placeholder === value.toUpperCase())) {
                                return "no placeholder available";
                            }

                            return "";
                        }
                    })
                        .then((value: string) => {
                            this.removeDecorations(editor);

                            if (!value) return;

                            let placeholder = _.find(this.placeholders, placeholder => placeholder.placeholder === value.toUpperCase())
                            this.setSelection(editor, placeholder);
                        }, () => {
                            this.removeDecorations(editor);
                        });
                }
            });
    };

    addDecoration = (editor: vscode.TextEditor, content: string, range: vscode.Range) => {
        let decoration = vscode.window.createTextEditorDecorationType({

            after: {
                contentText: content,
                backgroundColor: "yellow",
                textDecoration: "underline",
                border: "dotted thin black",
                color: "black",
                margin: `0 0 0 ${content.length * -7}px`,
                // height: '13px',
                width: `${(content.length * 7) + 5}px`

            }
        });

        this.decorations.push(decoration);

        editor.setDecorations(decoration, [range]);
    }

    removeDecorations = (editor: vscode.TextEditor) => {
        _.each(this.decorations, (item) => {
            editor.setDecorations(item, []);
            item.dispose();
        });

    }

    indexesOf = (str: string, char: string) => {
        if (char.length === 0) {
            return [];
        }

        let indices = [];
        //splitted by spaces
        let words = str.split(" ");
        //current line index
        let index = 0;

        for (var i = 0; i < words.length; i++) {

            if (words[i][0] && words[i][0].toLowerCase() === char.toLowerCase()) {
                indices.push(index);
            };

            // increment by word and white space
            index += words[i].length + 1;
        }
        return indices;
    }

    nextPlaceholder = (current: PlaceHolder): PlaceHolder => {
        let result = new PlaceHolder();
        result.index = 0;

        if (current) {
            result.index = current.index + 1;
        }

        result.placeholder = this.preparedCharacters[result.index];

        return result;
    }

    isLastChar = (char: string) => {

        let index = this.characters.indexOf(char);
        return index + 1 >= this.characters.length;
    }

    nextChar = (char: string) => {

        if (this.isLastChar(char)) {
            return this.characters[0];
        }
        else {
            let index = this.characters.indexOf(char);
            return this.characters[index + 1];
        }
    }

    setSelection = (editor: vscode.TextEditor, placeholder: PlaceHolder) => {
        editor.selection = new vscode.Selection(new vscode.Position(placeholder.line, placeholder.character), new vscode.Position(placeholder.line, placeholder.character));
    }
}
