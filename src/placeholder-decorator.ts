import * as vscode from 'vscode';
import * as _ from "lodash";

import { PlaceHolder } from './placeholder-calculus';
import { Config } from './config';

export class PlaceHolderDecorator {

    private config: Config;
    private cache: { [index: string]: vscode.Uri };
    private decorations: vscode.TextEditorDecorationType[] = [];

    private width: number = 12;
    private height: number = 14;

    load = (config: Config) => {
        this.config = config;

        this.updateCache();
    }

    addDecorations = (editor: vscode.TextEditor, placeholders: PlaceHolder[]) => {

        let decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                margin: `0 0 0 -7px`,
                height: `${this.height}px`,
                width: `${this.width}px`
            }
        });

        let options = [];
        _.each(placeholders, (placeholder) => {

            let option = {
                range: new vscode.Range(placeholder.line, placeholder.character + 1, placeholder.line, placeholder.character + 1),
                renderOptions: {
                    dark: {
                        after: {
                            contentIconPath: this.cache[placeholder.placeholder]
                        }
                    },
                    light: {
                        after: {
                            contentIconPath: this.cache[placeholder.placeholder]
                        }
                    }
                }
            };

            options.push(option);
        })

        this.decorations.push(decorationType);

        editor.setDecorations(decorationType, options);
    }

    removeDecorations = (editor: vscode.TextEditor) => {
        _.each(this.decorations, (item) => {
            editor.setDecorations(item, []);
            item.dispose();
        });

    }

    private updateCache = () => {
        this.cache = {};

        _.each(this.config.characters, code => this.cache[code] = this.buildUri(code))
    }

    private buildUri = (code: string) => {
        return vscode.Uri.parse(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" height="${this.height}" width="${this.width}"><rect width="${this.width}" height="${this.height}" rx="2" ry="2" style="fill: ${this.config.placeholder.backgroundColor};"></rect><text font-weight="${this.config.placeholder.fontWeight}" font-family="${this.config.placeholder.fontFamily}" font-size="${this.config.placeholder.fontSize}px" fill="${this.config.placeholder.color}" x="2" y="12">${this.config.placeholder.upperCase ? code.toUpperCase() : code.toLowerCase()}</text></svg>`);
    }

}