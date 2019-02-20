import { find, head } from 'ramda';
import {
  commands,
  ExtensionContext,
  Position,
  Range,
  Selection,
  TextEditor,
  window,
  workspace
} from 'vscode';

import { buildConfig, Config } from './config/config';
import { InlineInput } from './inline-input';
import { JumpSelection } from './models/jump-selection';
import { LineIndexes } from './models/line-indexes';
import { PlaceHolder } from './models/place-holder';
import { PlaceHolderCalculus } from './placeholder-calculus';
import { PlaceHolderDecorator } from './placeholder-decorator';

export class AceJump {
  private config: Config;
  private placeholderCalculus = new PlaceHolderCalculus();
  private placeHolderDecorator = new PlaceHolderDecorator();

  private isJumping = false;

  public configure(context: ExtensionContext) {
    context.subscriptions.push(
      commands.registerCommand('extension.aceJump', () => {
        if (!this.isJumping) {
          this.isJumping = true;
          this.jump((editor, placeholder) => {
            editor.selection = new Selection(
              new Position(placeholder.line, placeholder.character),
              new Position(placeholder.line, placeholder.character)
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
    context.subscriptions.push(
      commands.registerCommand('extension.aceJump.selection', () => {
        if (!this.isJumping) {
          this.isJumping = true;
          this.jump((editor, placeholder) => {
            editor.selection = new Selection(
              new Position(
                editor.selection.active.line,
                editor.selection.active.character
              ),
              new Position(placeholder.line, placeholder.character)
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

    workspace.onDidChangeConfiguration(this.loadConfig);
    this.loadConfig();
  }

  private loadConfig() {
    const config = workspace.getConfiguration('aceJump');

    this.config = buildConfig(config);

    this.placeholderCalculus.load(this.config);
    this.placeHolderDecorator.load(this.config);
  }

  private jump = (
    action: (editor: TextEditor, placeholder: PlaceHolder) => void
  ): Promise<void> => {
    return new Promise<void>((jumpResolve, jumpReject) => {
      const editor = window.activeTextEditor;

      if (!editor) {
        jumpReject();
        return;
      }

      const messaggeDisposable = window.setStatusBarMessage('AceJump: Type');
      new Promise<PlaceHolder>((resolve, reject) => {
        new InlineInput()
          .show(editor, v => v)
          .then((value: string) => {
            if (!value) {
              reject();
              return;
            }

            if (value && value.length > 1) {
              value = value.substring(0, 1);
            }

            const selection = this.getJumpSelection(editor);

            const lineIndexes = this.find(editor, selection, value);
            if (lineIndexes.count <= 0) {
              reject('AceJump: no matches');
              return;
            }

            const placeholders: PlaceHolder[] = this.placeholderCalculus.buildPlaceholders(
              lineIndexes
            );

            if (placeholders.length === 0) {
              return;
            }

            if (placeholders.length === 1) {
              const placeholder = head(placeholders);
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
          window.setStatusBarMessage('AceJump: Jumped!', 2000);
          messaggeDisposable.dispose();
          jumpResolve();
        })
        .catch((reason: string | null) => {
          if (!reason) {
            reason = 'Canceled!';
          }
          window.setStatusBarMessage(`AceJump: ${reason}`, 2000);
          messaggeDisposable.dispose();
          jumpReject();
        });
    });
  };

  private getJumpSelection(editor: TextEditor): JumpSelection {
    const jumpSelection = new JumpSelection();

    if (!this.config.finder.skipSelection && !editor.selection.isEmpty) {
      jumpSelection.text = editor.document.getText(editor.selection);

      if (editor.selection.anchor.line > editor.selection.active.line) {
        jumpSelection.startLine = editor.selection.active.line;
        jumpSelection.lastLine = editor.selection.anchor.line;
      } else {
        jumpSelection.startLine = editor.selection.anchor.line;
        jumpSelection.lastLine = editor.selection.active.line;
      }
    } else {
      if (editor.visibleRanges.length === 0) {
        throw Error('There are no visible ranges!');
      }

      const visibleRange = head(editor.visibleRanges);

      if (!!visibleRange) {
        jumpSelection.startLine = visibleRange.start.line;
        jumpSelection.lastLine = visibleRange.end.line;
      }

      jumpSelection.text = editor.document.getText(
        new Range(jumpSelection.startLine, 0, jumpSelection.lastLine, 0)
      );
    }

    return jumpSelection;
  }

  private find(
    editor: TextEditor,
    selection: JumpSelection,
    value: string
  ): LineIndexes {
    const lineIndexes: LineIndexes = {
      count: 0,
      indexes: {}
    };

    for (let i = selection.startLine; i < selection.lastLine; i++) {
      const line = editor.document.lineAt(i);
      const indexes = this.indexesOf(line.text, value);

      lineIndexes.count += indexes.length;

      lineIndexes.indexes[i] = indexes;
    }

    return lineIndexes;
  }

  // TODO: test
  private indexesOf(str: string, char: string): number[] {
    if (char.length === 0) {
      return [];
    }

    char = char.toLowerCase();

    const indices = [];
    const finderPatternRegex = new RegExp(this.config.finder.pattern);

    if (
      this.config.finder.onlyInitialLetter &&
      !finderPatternRegex.test(char)
    ) {
      // current line index
      let index = 0;

      // splitted by the pattern
      const words = str.split(finderPatternRegex);

      for (const word of words) {
        if (words[word][0] && words[word][0].toLowerCase() === char) {
          indices.push(index);
        }

        // increment by word and white space
        index += words[word].length + 1;
      }
    } else {
      const regexp = new RegExp(`[${char}]`, 'gi');
      let match: RegExpMatchArray | null;
      // tslint:disable-next-line:no-conditional-assignment
      while ((match = regexp.exec(str)) != null) {
        if (match.index !== undefined) {
          indices.push(match.index);
        }
      }
    }

    return indices;
  }

  private prepareForJumpTo(editor: TextEditor, placeholders: PlaceHolder[]) {
    return new Promise<PlaceHolder>((resolve, reject) => {
      this.placeHolderDecorator.addDecorations(editor, placeholders);

      const messageDisposable = window.setStatusBarMessage('AceJump: Jump To');
      new InlineInput()
        .show(editor, v => v)
        .then((value: string) => {
          this.placeHolderDecorator.removeDecorations(editor);

          if (!value) {
            return;
          }

          let placeholder = find(
            plc => plc.placeholder === value.toLowerCase(),
            placeholders
          );

          if (!placeholder) {
            reject();
            return;
          }

          if (placeholder.root) {
            placeholder = placeholder.root;
          }

          if (placeholder.childrens.length > 1) {
            this.prepareForJumpTo(editor, placeholder.childrens)
              .then(plc => {
                resolve(plc);
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
  }
}
