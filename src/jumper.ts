import { find, head } from 'ramda';
import { Disposable, TextEditor, window } from 'vscode';

import { AreaIndexFinder } from './area-index-finder';
import { Config } from './config/config';
import { InlineInput } from './inline-input';
import { JumpAreaFinder } from './jump-area-finder';
import { CancelReason } from './models/cancel-reason';
import { JumpKind } from './models/jump-kind';
import { JumpResult } from './models/jump-result';
import { LineIndexes } from './models/line-indexes';
import { Placeholder } from './models/placeholder';
import { PlaceHolderCalculus } from './placeholder-calculus';
import { PlaceHolderDecorator } from './placeholder-decorator';

export class Jumper {
  private placeholderCalculus = new PlaceHolderCalculus();
  private placeHolderDecorator = new PlaceHolderDecorator();
  private jumpAreaFinder = new JumpAreaFinder();
  private areaIndexFinder = new AreaIndexFinder();

  private isJumping = false;

  public jump(jumpKind: JumpKind): Promise<JumpResult> {
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

  public refreshConfig(config: Config) {
    this.placeholderCalculus.refreshConfig(config);
    this.placeHolderDecorator.refreshConfig(config);
    this.jumpAreaFinder.refreshConfig(config);
    this.areaIndexFinder.refreshConfig(config);
  }

  private askForInitialChar(jumpKind: JumpKind, editor: TextEditor) {
    return new Promise<Placeholder>(async (resolve, reject) => {
      try {
        let char = await new InlineInput().show();

        if (!char) {
          reject(CancelReason.EmptyValue);
          return;
        }

        if (char && char.length > 1) {
          char = char.substring(0, 1);
        }

        const area = this.jumpAreaFinder.findArea(editor);

        const lineIndexes = this.areaIndexFinder.findByChar(editor, area, char);

        if (lineIndexes.count <= 0) {
          reject(CancelReason.NoMatches);
          return;
        }

        let placeholders: Placeholder[] = this.placeholderCalculus.buildPlaceholders(
          lineIndexes
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
                lineIndexes
              );
            }

            if (placeholders.length > 1) {
              const jumpedPlaceholder = await this.recursivelyJumpTo(
                editor,
                placeholders
              );
              resolve(jumpedPlaceholder);
            } else {
              resolve(head(placeholders));
            }
          } catch (error) {
            reject(error);
          }
        }
      } catch (error) {
        reject(error);
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
      this.placeHolderDecorator.addDecorations(editor, placeholders);

      const messageDisposable = this.setMessage('Jump To', 5000);

      try {
        const char = await new InlineInput().show();

        if (!char) {
          reject(CancelReason.EmptyValue);
          return;
        }

        this.placeHolderDecorator.removeDecorations(editor);

        let placeholder = find(
          plc => plc.placeholder === char.toLowerCase(),
          placeholders
        );

        if (!placeholder) {
          reject(CancelReason.NoPlaceHolderMatched);
          return;
        }

        if (placeholder.root) {
          placeholder = placeholder.root;
        }

        if (placeholder.childrens.length > 1) {
          try {
            const innerPlaceholder = await this.recursivelyJumpTo(
              editor,
              placeholder.childrens
            );
            resolve(innerPlaceholder);
            messageDisposable.dispose();
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(placeholder);
          messageDisposable.dispose();
        }
      } catch (error) {
        this.placeHolderDecorator.removeDecorations(editor);
        messageDisposable.dispose();

        reject(error);
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
    lineIndexes: LineIndexes
  ) {
    return new Promise<Placeholder[]>(async (resolve, reject) => {
      this.placeHolderDecorator.addDecorations(editor, placeholders);
      this.placeHolderDecorator.addHighlights(
        editor,
        placeholders,
        lineIndexes.highlightCount
      );

      // max highlight count reached, we must jump to
      if (lineIndexes.highlightCount >= 10) {
        resolve(placeholders);
        return;
      } else {
        const messageDisposable = this.setMessage('Next char', 5000);

        try {
          const char = await new InlineInput().show();

          if (!char) {
            reject(CancelReason.EmptyValue);
            return;
          }

          this.placeHolderDecorator.removeDecorations(editor);

          const restrictedLineIndexes = this.areaIndexFinder.restrictByChar(
            editor,
            lineIndexes,
            char
          );

          if (restrictedLineIndexes.count <= 0) {
            // we keep the existing placeholders and try again
            resolve(
              await this.recursivelyRestrict(editor, placeholders, lineIndexes)
            );
            messageDisposable.dispose();
            return;
          }

          const restrictedPlaceholders: Placeholder[] = this.placeholderCalculus.buildPlaceholders(
            restrictedLineIndexes
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
                  restrictedLineIndexes
                )
              );
              messageDisposable.dispose();
            } catch (error) {
              reject(error);
            }
          }
        } catch (error) {
          if (error === true) {
            // we pressed the escape character | canceled so we can start to jump
            messageDisposable.dispose();

            resolve(placeholders);
          } else {
            this.placeHolderDecorator.removeDecorations(editor);
            messageDisposable.dispose();

            reject(error);
          }
        }
      }
    });
  }

  private buildMessage(error: CancelReason): string {
    switch (error) {
      case CancelReason.EmptyValue:
        return 'Empty Value';
      case CancelReason.NoMatches:
      case CancelReason.NoPlaceHolderMatched:
        return 'No Matches';
      default:
        return 'Canceled';
    }
  }

  private setMessage(message: string, timeout: number): Disposable {
    if (timeout > 0) {
      return window.setStatusBarMessage(`AceJump: ${message}`, timeout);
    } else {
      return window.setStatusBarMessage(`AceJump: ${message}`);
    }
  }
}
