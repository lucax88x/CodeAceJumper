import * as vscode from 'vscode';
import * as path from 'path';
import * as _ from "lodash";

class PlaceHolder {
    placeholder: string;
    line: number;
    character: number;
}

export class AceJump {

    characters: string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    placeholders: PlaceHolder[];

    decorations: vscode.TextEditorDecorationType[] = [];

    constructor(context: vscode.ExtensionContext) {

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

        let allText = editor.document.getText();

        vscode.window.showInputBox({
            prompt: "type letter",
            ignoreFocusOut: true,
            validateInput: (value: string) => {

                // if (value && value.length > 1)
                //     return "only one char";

                if (allText.indexOf(value) === -1)
                    return "this is missing";

                return "";
            }
        })
            .then((value: string) => {

                if (!value) return;

                // if (value && value.length > 1)
                //     value = value.substring(0, 1);

                let lineIndexes: { [key: number]: number[]; } = {};

                for (let i = 0; i < editor.document.lineCount; i++) {
                    let line = editor.document.lineAt(i);
                    lineIndexes[i] = this.indexesOf(line.text, value);
                }

                _.forOwn<number[]>(lineIndexes, (lineIndex, key) => {
                    let line = parseInt(key);

                    _.each(lineIndex, (character) => {
                        let placeholder = this.nextPlaceholder(_.last(this.placeholders));
                        this.placeholders.push({ placeholder: placeholder, line: line, character: character });

                        this.addDecoration(editor, placeholder, new vscode.Range(line, character, line, character));
                    });
                });

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

                        let placeHolder = _.find(this.placeholders, placeholder => placeholder.placeholder === value.toUpperCase())
                        editor.selection = new vscode.Selection(new vscode.Position(placeHolder.line, placeHolder.character), new vscode.Position(placeHolder.line, placeHolder.character));
                    }, () => {
                        this.removeDecorations(editor);
                    });
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

    indexesOf = (str: string, searchStr: string) => {
        if (searchStr.length === 0) {
            return [];
        }

        var indices = [];
        if (searchStr.length === 1) { // faster with 1 char
            for (var i = 0; i < str.length; i++) {
                if (str[i] === searchStr) indices.push(i);
            }
            return indices;
        }
        else {

            let startIndex = 0, index;

            while ((index = str.indexOf(searchStr, startIndex)) > -1) {
                indices.push(index);
                startIndex = index + searchStr.length;
            }
        }

        return indices;
    }

    nextPlaceholder = (current: PlaceHolder): string => {
        if (!current)
            return this.characters[0];

        let placeholder = current.placeholder;
        let remaining = "";
        if (current.placeholder.length > 1) {
            placeholder = current.placeholder.substr(placeholder.length - 1);
            remaining = current.placeholder.substr(0, current.placeholder.length - 1);
        }

        let index = this.characters.indexOf(placeholder);

        if (index + 1 >= this.characters.length) {
            let result = "";
            for (let i = 0; i < current.placeholder.length + 1; i++)
                result += this.characters[0];

            return result;
        }
        else {
            return remaining + this.characters[index + 1];
        }
    }
}
