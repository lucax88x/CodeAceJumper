import * as vscode from 'vscode';
import * as _ from 'lodash';

import { PlaceHolderCalculus, PlaceHolder } from './placeholder-calculus';



class Selection {
    text: string;
    startLine: number;
    lastLine: number;
}

export interface ILineIndexes { [key: number]: number[]; }

export class AceJump {
    decorations: vscode.TextEditorDecorationType[] = [];
    placeholderCalculus: PlaceHolderCalculus = new PlaceHolderCalculus();

    configure = (context: vscode.ExtensionContext) => {

        let disposables: vscode.Disposable[] = [];

        disposables.push(vscode.commands.registerCommand('extension.aceJump', () => {
            this.jump();
        }));

        for (let i = 0; i < disposables.length; i++) {
            context.subscriptions.push(disposables[i]);
        }
    }

    private jump = () => {

        let editor = vscode.window.activeTextEditor;

        if (!editor) {
            return; // No open text editor
        }

        let selection: Selection = this.getSelection(editor);

        vscode.window.showInputBox({
            prompt: "type",
            ignoreFocusOut: true,
            validateInput: (value: string) => {

                if (value && value.length > 1)
                    return "only one char";

                if (selection.text.indexOf(value) === -1)
                    return "this is missing";

                return "";
            }
        })
            .then((value: string) => {

                if (!value) return;

                if (value && value.length > 1)
                    value = value.substring(0, 1);

                let lineIndexes: ILineIndexes = this.find(editor, selection, value);
                let placeholders: PlaceHolder[] = this.placeholderCalculus.buildPlaceholders(lineIndexes);

                if (placeholders.length === 0) return;
                if (placeholders.length === 1) {
                    let placeholder = _.first(placeholders);
                    this.setSelection(editor, placeholder);
                }
                else {

                    _.each(placeholders, (placeholder) => {
                        this.addDecoration(editor, placeholder.placeholder, new vscode.Range(placeholder.line, placeholder.character, placeholder.line, placeholder.character + 1));
                    })

                    vscode.window.showInputBox({
                        ignoreFocusOut: true,
                        prompt: "ace jump to",
                        validateInput: (value: string) => {

                            if (!_.find(placeholders, placeholder => placeholder.placeholder === value.toUpperCase())) {
                                return "no placeholder available";
                            }

                            return "";
                        }
                    })
                        .then((value: string) => {
                            this.removeDecorations(editor);

                            if (!value) return;

                            let placeholder = _.find(placeholders, placeholder => placeholder.placeholder === value.toUpperCase())
                            this.setSelection(editor, placeholder);
                        }, () => {
                            this.removeDecorations(editor);
                        });
                }
            });
    };

    private getSelection = (editor: vscode.TextEditor): Selection => {

        let selection: Selection = new Selection();

        if (!editor.selection.isEmpty) {
            selection.text = editor.document.getText(editor.selection);

            if (editor.selection.anchor.line > editor.selection.active.line) {
                selection.startLine = editor.selection.active.line;
                selection.lastLine = editor.selection.anchor.line;
            }
            else {
                selection.startLine = editor.selection.anchor.line;
                selection.lastLine = editor.selection.active.line;
            }
        }
        else {
            selection.text = editor.document.getText();

            selection.startLine = 0;
            selection.lastLine = editor.document.lineCount;
        }

        return selection;
    }

    private addDecoration = (editor: vscode.TextEditor, content: string, range: vscode.Range) => {
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

    private removeDecorations = (editor: vscode.TextEditor) => {
        _.each(this.decorations, (item) => {
            editor.setDecorations(item, []);
            item.dispose();
        });

    }

    private setSelection = (editor: vscode.TextEditor, placeholder: PlaceHolder) => {
        editor.selection = new vscode.Selection(new vscode.Position(placeholder.line, placeholder.character), new vscode.Position(placeholder.line, placeholder.character));
    }

    private find = (editor: vscode.TextEditor, selection: Selection, value: string): ILineIndexes => {
        let lineIndexes: ILineIndexes = {};

        for (let i = selection.startLine; i < selection.lastLine; i++) {
            let line = editor.document.lineAt(i);
            lineIndexes[i] = this.indexesOf(line.text, value);
        }

        return lineIndexes;
    }

    private indexesOf = (str: string, char: string) => {
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
}
