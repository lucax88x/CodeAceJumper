import { find, first } from "lodash";
import * as vscode from "vscode";

import { Config } from "./config";
import { InlineInput } from "./inline-input";
import { PlaceHolder, PlaceHolderCalculus } from "./placeholder-calculus";
import { PlaceHolderDecorator } from "./placeholder-decorator";

class Selection {
  text: string;
  startLine: number;
  lastLine: number;
}

export interface IIndexes {
  [key: number]: number[];
}

export interface ILineIndexes {
  count: number;
  indexes: IIndexes;
}

export class AceJump {
  config: Config = new Config();
  placeholderCalculus: PlaceHolderCalculus = new PlaceHolderCalculus();
  placeHolderDecorator: PlaceHolderDecorator = new PlaceHolderDecorator();

  isJumping: boolean = false;

  configure = (context: vscode.ExtensionContext) => {
    let disposables: vscode.Disposable[] = [];

    disposables.push(
      vscode.commands.registerCommand("extension.aceJump", () => {
        if (!this.isJumping) {
          this.isJumping = true;
          this.jump((editor, placeholder) => {
            editor.selection = new vscode.Selection(
              new vscode.Position(placeholder.line, placeholder.character),
              new vscode.Position(placeholder.line, placeholder.character)
            );
          })
            .then(() => {
              this.isJumping = false;
            })
            .catch(() => {
              this.isJumping = false;
            });
        }
      })
    );
    disposables.push(
      vscode.commands.registerCommand("extension.aceJump.selection", () => {
        if (!this.isJumping) {
          this.isJumping = true;
          this.jump((editor, placeholder) => {
            editor.selection = new vscode.Selection(
              new vscode.Position(
                editor.selection.active.line,
                editor.selection.active.character
              ),
              new vscode.Position(placeholder.line, placeholder.character)
            );
          })
            .then(() => {
              this.isJumping = false;
            })
            .catch(() => {
              this.isJumping = false;
            });
        }
      })
    );

    for (let i = 0; i < disposables.length; i++) {
      context.subscriptions.push(disposables[i]);
    }

    vscode.workspace.onDidChangeConfiguration(this.loadConfig);
    this.loadConfig();
  };

  private loadConfig = () => {
    let config = vscode.workspace.getConfiguration("aceJump");

    this.config.placeholder.backgroundColor = config.get<string>(
      "placeholder.backgroundColor"
    );
    this.config.placeholder.color = config.get<string>("placeholder.color");
    this.config.placeholder.border = config.get<string>("placeholder.border");

    this.config.placeholder.width = config.get<number>("placeholder.width");
    this.config.placeholder.height = config.get<number>("placeholder.height");

    this.config.placeholder.textPosX = config.get<number>(
      "placeholder.textPosX"
    );
    this.config.placeholder.textPosY = config.get<number>(
      "placeholder.textPosY"
    );

    this.config.placeholder.fontSize = config.get<number>(
      "placeholder.fontSize"
    );
    this.config.placeholder.fontWeight = config.get<string>(
      "placeholder.fontWeight"
    );
    this.config.placeholder.fontFamily = config.get<string>(
      "placeholder.fontFamily"
    );
    this.config.placeholder.upperCase = config.get<boolean>(
      "placeholder.upperCase"
    );

    this.config.finder.pattern = config.get<string>("finder.pattern");
    this.config.finder.skipSelection = config.get<boolean>(
      "finder.skipSelection"
    );
    this.config.finder.onlyInitialLetter = config.get<boolean>(
      "finder.onlyInitialLetter"
    );

    this.placeholderCalculus.load(this.config);
    this.placeHolderDecorator.load(this.config);
  };

  private jump = (
    action: (editor: vscode.TextEditor, placeholder: PlaceHolder) => void
  ): Promise<void> => {
    return new Promise<void>((jumpResolve, jumpReject) => {
      let editor = vscode.window.activeTextEditor;

      if (!editor) {
        jumpReject();
        return;
      }

      let messaggeDisposable = vscode.window.setStatusBarMessage(
        "AceJump: Type"
      );
      const promise = new Promise<PlaceHolder>((resolve, reject) => {
        let firstInlineInput = new InlineInput()
          .show(editor, v => v)
          .then((value: string) => {
            if (!value) {
              reject();
              return;
            }

            if (value && value.length > 1) value = value.substring(0, 1);

            let selection: Selection = this.getSelection(editor);

            let lineIndexes: ILineIndexes = this.find(editor, selection, value);
            if (lineIndexes.count <= 0) {
              reject("AceJump: no matches");
              return;
            }

            let placeholders: PlaceHolder[] = this.placeholderCalculus.buildPlaceholders(
              lineIndexes
            );

            if (placeholders.length === 0) return;
            if (placeholders.length === 1) {
              let placeholder = first(placeholders);
              resolve(placeholder);
            } else {
              this.prepareForJumpTo(editor, placeholders)
                .then(placeholder => {
                  resolve(placeholder);
                })
                .catch(() => {
                  reject();
                });
            }
          })
          .catch(() => {
            reject();
          });
      })
        .then((placeholder: PlaceHolder) => {
          action(editor, placeholder);
          vscode.window.setStatusBarMessage("AceJump: Jumped!", 2000);
          messaggeDisposable.dispose();
          jumpResolve();
        })
        .catch((reason?: string) => {
          if (!reason) reason = "Canceled!";
          vscode.window.setStatusBarMessage(`AceJump: ${reason}`, 2000);
          messaggeDisposable.dispose();
          jumpReject();
        });
    });
  };

  private getSelection = (editor: vscode.TextEditor): Selection => {
    let selection: Selection = new Selection();

    if (!this.config.finder.skipSelection && !editor.selection.isEmpty) {
      selection.text = editor.document.getText(editor.selection);

      if (editor.selection.anchor.line > editor.selection.active.line) {
        selection.startLine = editor.selection.active.line;
        selection.lastLine = editor.selection.anchor.line;
      } else {
        selection.startLine = editor.selection.anchor.line;
        selection.lastLine = editor.selection.active.line;
      }
    } else {
      if (editor.visibleRanges.length === 0) {
        throw Error("There are no visible ranges!");
      }

      const visibleRange = first(editor.visibleRanges);
      selection.startLine = visibleRange.start.line;
      selection.lastLine = visibleRange.end.line;

      selection.text = editor.document.getText(
        new vscode.Range(selection.startLine, 0, selection.lastLine, 0)
      );
    }

    return selection;
  };

  private find = (
    editor: vscode.TextEditor,
    selection: Selection,
    value: string
  ): ILineIndexes => {
    let lineIndexes: ILineIndexes = {
      count: 0,
      indexes: {}
    };

    for (let i = selection.startLine; i < selection.lastLine; i++) {
      let line = editor.document.lineAt(i);
      let indexes = this.indexesOf(line.text, value);

      lineIndexes.count += indexes.length;

      lineIndexes.indexes[i] = indexes;
    }

    return lineIndexes;
  };

  private indexesOf = (str: string, char: string): number[] => {
    if (char.length === 0) {
      return [];
    }

    char = char.toLowerCase();

    let indices = [];
    const finderPatternRegex = new RegExp(this.config.finder.pattern);

    if (
      this.config.finder.onlyInitialLetter &&
      !finderPatternRegex.test(char)
    ) {
      //current line index
      let index = 0;

      //splitted by the pattern
      let words = str.split(finderPatternRegex);
      for (var w = 0; w < words.length; w++) {
        if (words[w][0] && words[w][0].toLowerCase() === char) {
          indices.push(index);
        }

        // increment by word and white space
        index += words[w].length + 1;
      }
    } else {
      let regexp = new RegExp(`[${char}]`, "gi");
      let match: RegExpMatchArray;
      while ((match = regexp.exec(str)) != null) {
        indices.push(match.index);
      }
    }

    return indices;
  };

  private prepareForJumpTo = (
    editor: vscode.TextEditor,
    placeholders: PlaceHolder[]
  ) => {
    return new Promise<PlaceHolder>((resolve, reject) => {
      this.placeHolderDecorator.addDecorations(editor, placeholders);

      let messageDisposable = vscode.window.setStatusBarMessage(
        "AceJump: Jump To"
      );
      new InlineInput()
        .show(editor, v => v)
        .then((value: string) => {
          this.placeHolderDecorator.removeDecorations(editor);

          if (!value) return;

          let placeholder = find(
            placeholders,
            placeholder => placeholder.placeholder === value.toLowerCase()
          );

          if (placeholder.root) placeholder = placeholder.root;

          if (placeholder.childrens.length > 1) {
            this.prepareForJumpTo(editor, placeholder.childrens)
              .then(placeholder => {
                resolve(placeholder);
                messageDisposable.dispose();
              })
              .catch(() => {
                reject();
              });
          } else {
            resolve(placeholder);
            messageDisposable.dispose();
          }
        })
        .catch(() => {
          this.placeHolderDecorator.removeDecorations(editor);
          messageDisposable.dispose();
          reject();
        });
    });
  };
}
