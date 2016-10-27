import { InlineInput } from './inline-input';
import * as vscode from 'vscode';
import * as _ from 'lodash';

import { PlaceHolder, PlaceHolderCalculus } from './placeholder-calculus';

class Selection {
    text: string;
    startLine: number;
    lastLine: number;
}

export interface IIndexes { [key: number]: number[]; }

interface ILineIndexes {
    indexes: IIndexes;
    hasIndexes: boolean;
}

class Config {
    placeholder: PlaceHolderConfig = new PlaceHolderConfig();
}

class PlaceHolderConfig {
    backgroundColor: string;
    color: string;
    border: string;
}

export class AceJump {
    decorations: vscode.TextEditorDecorationType[] = [];
    placeholderCalculus: PlaceHolderCalculus = new PlaceHolderCalculus();
    config: Config = new Config();

    configure = (context: vscode.ExtensionContext) => {

        let disposables: vscode.Disposable[] = [];

        disposables.push(vscode.commands.registerCommand('extension.aceJump', () => {
            this.jump();
        }));

        for (let i = 0; i < disposables.length; i++) {
            context.subscriptions.push(disposables[i]);
        }

        vscode.workspace.onDidChangeConfiguration(this.loadConfig);
        this.loadConfig();
    }

    private loadConfig = () => {
        let config = vscode.workspace.getConfiguration("aceJump");

        this.config.placeholder.backgroundColor = config.get<string>("placeholder.backgroundColor");
        this.config.placeholder.color = config.get<string>("placeholder.color");
        this.config.placeholder.border = config.get<string>("placeholder.border");
    }

    private jump = () => {

        let editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        let selection: Selection = this.getSelection(editor);

        const promise = new Promise<PlaceHolder>((resolve, reject) => {
            vscode.window.setStatusBarMessage("AceJump: Type");
            new InlineInput().show(editor, (v) => v)
                .then((value: string) => {
                    if (!value) {
                        reject();
                        return;
                    };

                    if (value && value.length > 1)
                        value = value.substring(0, 1);

                    let lineIndexes: ILineIndexes = this.find(editor, selection, value);
                    if (!lineIndexes.hasIndexes) {
                        reject("AceJump: no matches");
                        return;
                    }

                    let placeholders: PlaceHolder[] = this.placeholderCalculus.buildPlaceholders(lineIndexes.indexes);

                    if (placeholders.length === 0) return;
                    if (placeholders.length === 1) {
                        let placeholder = _.first(placeholders);
                        resolve(placeholder);
                    }
                    else {

                        _.each(placeholders, (placeholder) => {
                            this.addDecoration(editor, placeholder.placeholder, new vscode.Range(placeholder.line, placeholder.character, placeholder.line, placeholder.character + 1));
                        })

                        vscode.window.setStatusBarMessage("AceJump: Jump To");
                        new InlineInput().show(editor, (v) => v)
                            .then((value: string) => {
                                this.removeDecorations(editor);

                                if (!value) return;

                                let placeholder = _.find(placeholders, placeholder => placeholder.placeholder === value.toUpperCase())
                                resolve(placeholder);
                            }).catch(() => {
                                this.removeDecorations(editor);
                                reject();
                            });
                    }
                }).catch(() => {
                    reject();
                });
        })
            .then((placeholder: PlaceHolder) => {
                this.setSelection(editor, placeholder);
                vscode.window.setStatusBarMessage("AceJump: Jumped!", 2000);
            })
            .catch((reason?: string) => {
                vscode.window.setStatusBarMessage((reason) ? reason : "AceJump: canceled");
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
                backgroundColor: this.config.placeholder.backgroundColor,
                border: this.config.placeholder.border,
                color: this.config.placeholder.color,
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
        let lineIndexes: ILineIndexes = {
            hasIndexes: false,
            indexes: {}
        };

        for (let i = selection.startLine; i < selection.lastLine; i++) {
            let line = editor.document.lineAt(i);
            let indexes = this.indexesOf(line.text, value);

            if (!lineIndexes.hasIndexes && indexes.length > 0)
                lineIndexes.hasIndexes = true;

            lineIndexes.indexes[i] = indexes;
        }

        return lineIndexes;
    }

    private indexesOf = (str: string, char: string): number[] => {
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
