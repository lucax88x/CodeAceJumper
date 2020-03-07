import { find, head } from 'ramda';
import {
  commands,
  Disposable,
  TextEditor,
  window,
  Selection,
  Position,
} from 'vscode';
import { AreaIndexFinder } from './area-index-finder';
import { Config } from './config/config';
import { asyncDebounce } from './debounce';
import { InlineInput } from './inline-input';
import { JumpAreaFinder } from './jump-area-finder';
import { CancelReason } from './models/cancel-reason';
import { JumpKind } from './models/jump-kind';
import { JumpResult } from './models/jump-result';
import { LineIndexes } from './models/line-indexes';
import { Placeholder } from './models/placeholder';
import { PlaceHolderCalculus } from './placeholder-calculus';
import { PlaceHolderDecorator } from './placeholder-decorator';

const findPlaceholder = (char: string) =>
  find<Placeholder>(plc => plc.placeholder === char.toLowerCase());

export class Jumper {
  public isJumping = false;

  private config: Config;
  private placeholderCalculus = new PlaceHolderCalculus();
  private placeHolderDecorator = new PlaceHolderDecorator();
  private jumpAreaFinder = new JumpAreaFinder();
  private areaIndexFinder = new AreaIndexFinder();

  private input: InlineInput;
  private isInSelectionMode: boolean;

  public jump(
    jumpKind: JumpKind,
    isInSelectionMode: boolean,
  ): Promise<JumpResult> {
    this.isInSelectionMode = isInSelectionMode;

    if (!!this.isJumping) {
      this.setMessage('Canceled', 2000);
      return Promise.reject(new Error('Jumping in progress'));
    }

    this.isJumping = true;

    return new Promise<JumpResult>(async (resolve, reject) => {
      const editor = window.activeTextEditor;

      if (!editor) {
        reject(new Error('No active editor'));
        this.isJumping = false;
        return;
      }

      const messaggeDisposable = this.setMessage('Type', 5000);

      try {
        const placeholder = await this.askForInitialChar(jumpKind, editor);

        this.setMessage('Jumped!', 2000);

        messaggeDisposable.dispose();

        if (this.isInSelectionMode) {
          const isBackwardJump =
            editor.selection.active.line > placeholder.line ||
            editor.selection.active.character > placeholder.character;
          const offset =
            isBackwardJump || !this.config.finder.includeEndCharInSelection
              ? 0
              : 1;
          editor.selection = new Selection(
            new Position(
              editor.selection.active.line,
              editor.selection.active.character,
            ),
            new Position(placeholder.line, placeholder.character + offset),
          );
        } else {
          editor.selection = new Selection(
            new Position(placeholder.line, placeholder.character),
            new Position(placeholder.line, placeholder.character),
          );
        }
        await this.scrollToLine(placeholder.line);

        this.isJumping = false;
        resolve({ editor, placeholder });
      } catch (error) {
        messaggeDisposable.dispose();
        this.isJumping = false;

        if (error instanceof Error) {
          this.setMessage('Canceled', 2000);
          reject(error);
        } else {
          const message = this.buildMessage(error);
          this.setMessage(message, 2000);
          reject(new Error(message));
        }
      }
    });
  }

  public jumpToLine(isInSelectionMode: boolean | null): Promise<JumpResult> {
    if (isInSelectionMode !== null) {
      // if null, reuse the selectionMode from last call
      this.isInSelectionMode = isInSelectionMode;
    }
    if (!!this.input) {
      // we cancel any open InlineInput (e.g. from an interrupted call to jump())
      this.input.cancel();
    }

    this.isJumping = true;

    return new Promise<JumpResult>(async (resolve, reject) => {
      const editor = window.activeTextEditor;

      if (!editor) {
        reject(new Error('No active editor'));
        this.isJumping = false;
        return;
      }

      try {
        const placeholder = await this.buildPlaceholdersForLines(editor);

        this.setMessage('Jumped!', 2000);

        if (this.isInSelectionMode) {
          editor.selection = new Selection(
            new Position(
              editor.selection.active.line,
              editor.selection.active.character,
            ),
            new Position(placeholder.line, placeholder.character),
          );
        } else {
          editor.selection = new Selection(
            new Position(placeholder.line, placeholder.character),
            new Position(placeholder.line, placeholder.character),
          );
        }
        await this.scrollToLine(placeholder.line);

        this.isJumping = false;
        resolve({ editor, placeholder });
      } catch (error) {
        this.isJumping = false;

        if (error instanceof Error) {
          this.setMessage('Canceled', 2000);
          reject(error);
        } else {
          const message = this.buildMessage(error);
          this.setMessage(message, 2000);
          reject(new Error(message));
        }
      }
    });
  }

  public refreshConfig(config: Config) {
    this.config = config;
    this.placeholderCalculus.refreshConfig(config);
    this.placeHolderDecorator.refreshConfig(config);
    this.jumpAreaFinder.refreshConfig(config);
    this.areaIndexFinder.refreshConfig(config);
  }

  public scrollToLine = async (line: number) => {
    switch (this.config.scroll.mode) {
      case 'center':
        await commands.executeCommand('revealLine', {
          lineNumber: line,
          at: 'center',
        });
        break;
      case 'top':
        await commands.executeCommand('revealLine', {
          lineNumber: line,
          at: 'top',
        });
        break;
      default:
        break;
    }
  };

  private askForInitialChar(jumpKind: JumpKind, editor: TextEditor) {
    return new Promise<Placeholder>(async (resolve, reject) => {
      try {
        this.input = new InlineInput();
        let char = await this.input.show();

        if (!char) {
          reject(CancelReason.EmptyValue);
          return;
        }

        if (char && char.length > 1) {
          char = char.substring(0, 1);
        }

        const result = await this.buildPlaceholdersForChar(
          editor,
          char,
          jumpKind,
        );
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  private buildPlaceholdersForChar(
    editor: TextEditor,
    char: string,
    jumpKind: JumpKind,
  ) {
    return new Promise<Placeholder>(async (resolve, reject) => {
      try {
        const area = this.jumpAreaFinder.findArea(editor);

        const lineIndexes = this.areaIndexFinder.findByChar(editor, area, char);

        if (lineIndexes.count <= 0) {
          reject(CancelReason.NoMatches);
          return;
        }

        let placeholders: Placeholder[] = this.placeholderCalculus.buildPlaceholders(
          lineIndexes,
        );

        if (placeholders.length === 0) {
          reject(CancelReason.NoMatches);
          return;
        }

        if (placeholders.length === 1) {
          const placeholder = head(placeholders);
          resolve(placeholder);
        } else {
          try {
            if (jumpKind === JumpKind.MultiChar) {
              placeholders = await this.recursivelyRestrict(
                editor,
                placeholders,
                lineIndexes,
              );
            }

            if (placeholders.length > 1) {
              const jumpedPlaceholder = await this.recursivelyJumpTo(
                editor,
                placeholders,
              );
              resolve(jumpedPlaceholder);
            } else {
              resolve(head(placeholders));
            }
          } catch (error) {
            // let's try to recalculate placeholders if we change visible range
            if (error === CancelReason.ChangedVisibleRanges) {
              const debounced = await asyncDebounce(async () => {
                try {
                  const placeholder = await this.buildPlaceholdersForChar(
                    editor,
                    char,
                    jumpKind,
                  );
                  resolve(placeholder);
                } catch (error) {
                  reject(error);
                }
              }, 500);

              await debounced();
            } else {
              reject(error);
            }
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private buildPlaceholdersForLines(editor: TextEditor) {
    return new Promise<Placeholder>(async (resolve, reject) => {
      const area = this.jumpAreaFinder.findArea(editor);

      const lineIndexes = this.areaIndexFinder.findByLines(editor, area);

      if (lineIndexes.count <= 0) {
        reject(CancelReason.NoMatches);
        return;
      }

      const placeholders: Placeholder[] = this.placeholderCalculus.buildPlaceholders(
        lineIndexes,
      );

      if (placeholders.length === 0) {
        reject(CancelReason.NoMatches);
        return;
      }

      try {
        const jumpedPlaceholder = await this.recursivelyJumpTo(
          editor,
          placeholders,
        );
        resolve(jumpedPlaceholder);
      } catch (error) {
        // let's try to recalculate placeholders if we change visible range
        if (error === CancelReason.ChangedVisibleRanges) {
          const debounced = await asyncDebounce(async () => {
            try {
              const placeholder = await this.buildPlaceholdersForLines(editor);
              resolve(placeholder);
            } catch (error) {
              reject(error);
            }
          }, 500);

          await debounced();
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * recursively creates placeholders in supplied editor and waits for user input for jumping
   * @param editor
   * @param placeholders
   */
  private recursivelyJumpTo(editor: TextEditor, placeholders: Placeholder[]) {
    return new Promise<Placeholder>(async (resolve, reject) => {
      if (this.config.dim.enabled) {
        const placeholderHoles = this.placeholderCalculus.getPlaceholderHoles(
          placeholders,
          editor.document.lineCount,
        );
        this.placeHolderDecorator.dimEditor(editor, placeholderHoles);
      }

      this.placeHolderDecorator.removeDecorations(editor);
      this.placeHolderDecorator.removeHighlights(editor);
      this.placeHolderDecorator.addDecorations(editor, placeholders);

      const messageDisposable = this.setMessage('Jump To', 5000);

      try {
        const char = await new InlineInput().show();

        if (!char) {
          reject(CancelReason.EmptyValue);
          return;
        }

        this.placeHolderDecorator.removeDecorations(editor);
        this.placeHolderDecorator.removeHighlights(editor);
        this.placeHolderDecorator.undimEditor(editor);

        let placeholder = findPlaceholder(char)(placeholders);

        if (!placeholder) {
          reject(CancelReason.NoPlaceHolderMatched);
          return;
        }

        if (placeholder.root) {
          placeholder = placeholder.root;
        }

        const resolvedPlaceholder = await this.resolvePlaceholderOrChildren(
          placeholder,
          editor,
        );
        resolve(resolvedPlaceholder);

        messageDisposable.dispose();
      } catch (error) {
        this.placeHolderDecorator.removeDecorations(editor);
        this.placeHolderDecorator.removeHighlights(editor);
        this.placeHolderDecorator.undimEditor(editor);
        messageDisposable.dispose();

        reject(error);
      }
    });
  }

  private async resolvePlaceholderOrChildren(
    placeholder: Placeholder,
    editor: TextEditor,
  ) {
    return new Promise<Placeholder>(async (resolve, reject) => {
      if (placeholder.childrens.length > 1) {
        try {
          const innerPlaceholder = await this.recursivelyJumpTo(
            editor,
            placeholder.childrens,
          );
          resolve(innerPlaceholder);
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(placeholder);
      }
    });
  }

  /**
   * recursively restrict placeholders in supplied editor with supplied input from user
   * @param editor
   * @param placeholders
   * @param lineIndexes
   */
  private recursivelyRestrict(
    editor: TextEditor,
    placeholders: Placeholder[],
    lineIndexes: LineIndexes,
  ) {
    return new Promise<Placeholder[]>(async (resolve, reject) => {
      if (this.config.dim.enabled) {
        const placeholderHoles = this.placeholderCalculus.getPlaceholderHoles(
          placeholders,
          editor.document.lineCount,
          lineIndexes.highlightCount,
        );
        this.placeHolderDecorator.dimEditor(editor, placeholderHoles);
      }

      this.placeHolderDecorator.addDecorations(editor, placeholders);
      this.placeHolderDecorator.addHighlights(
        editor,
        placeholders,
        lineIndexes.highlightCount,
      );

      const messageDisposable = this.setMessage('Next char', 5000);

      try {
        const char = await new InlineInput().show();

        if (!char) {
          reject(CancelReason.EmptyValue);
          return;
        }

        this.placeHolderDecorator.removeDecorations(editor);
        this.placeHolderDecorator.removeHighlights(editor);
        this.placeHolderDecorator.undimEditor(editor);

        const restrictedLineIndexes = this.areaIndexFinder.restrictByChar(
          editor,
          lineIndexes,
          char,
        );

        // we failed to restrict
        if (restrictedLineIndexes.count <= 0) {
          // we try to check if char matches placeholder
          const placeholder = findPlaceholder(char)(placeholders);

          if (!!placeholder) {
            const resolvedPlaceholder = await this.resolvePlaceholderOrChildren(
              placeholder,
              editor,
            );

            resolve([resolvedPlaceholder]);
            messageDisposable.dispose();

            return;
          } else {
            // we keep the existing placeholders and try again
            resolve(
              await this.recursivelyRestrict(editor, placeholders, lineIndexes),
            );
            messageDisposable.dispose();
            return;
          }
        }

        const restrictedPlaceholders: Placeholder[] = this.placeholderCalculus.buildPlaceholders(
          restrictedLineIndexes,
        );

        if (restrictedPlaceholders.length === 0) {
          reject(CancelReason.NoMatches);
          return;
        }

        if (restrictedPlaceholders.length === 1) {
          resolve(restrictedPlaceholders);
        } else {
          try {
            resolve(
              await this.recursivelyRestrict(
                editor,
                restrictedPlaceholders,
                restrictedLineIndexes,
              ),
            );
            messageDisposable.dispose();
          } catch (error) {
            console.error(error);
            reject(error);
          }
        }
      } catch (error) {
        console.error(error);
        if (error === CancelReason.Cancel) {
          // we pressed the escape character | canceled so we can start to jump
          messageDisposable.dispose();

          resolve(placeholders);
        } else {
          this.placeHolderDecorator.removeDecorations(editor);
          this.placeHolderDecorator.removeHighlights(editor);
          this.placeHolderDecorator.undimEditor(editor);
          messageDisposable.dispose();

          reject(error);
        }
      }
    });
  }

  private buildMessage(error: CancelReason): string {
    switch (error) {
      case CancelReason.EmptyValue:
        return 'Empty Value';
      case CancelReason.ChangedActiveEditor:
        return 'Changed editor';
      case CancelReason.ChangedVisibleRanges:
        return 'Changed visible range';
      case CancelReason.NoMatches:
      case CancelReason.NoPlaceHolderMatched:
        return 'No Matches';
      default:
        return 'Canceled';
    }
  }

  private setMessage(message: string, timeout: number): Disposable {
    if (timeout > 0) {
      return window.setStatusBarMessage(`$(rocket) ${message}`, timeout);
    } else {
      return window.setStatusBarMessage(`$(rocket) ${message}`);
    }
  }
}
