import { find, head } from 'ramda';
import { Disposable, TextEditor, window } from 'vscode';

import { AreaIndexFinder } from './area-index-finder';
import { Config } from './config/config';
import { InlineInput } from './inline-input';
import { JumpAreaFinder } from './jump-area-finder';
import { CancelReason } from './models/cancel-reason';
import { JumpResult } from './models/jump-result';
import { PlaceHolder } from './models/place-holder';
import { PlaceHolderCalculus } from './placeholder-calculus';
import { PlaceHolderDecorator } from './placeholder-decorator';

export class Jumper {
  private placeholderCalculus = new PlaceHolderCalculus();
  private placeHolderDecorator = new PlaceHolderDecorator();
  private jumpAreaFinder = new JumpAreaFinder();
  private areaIndexFinder = new AreaIndexFinder();

  private isJumping = false;

  public jump(): Promise<JumpResult> {
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

      const messaggeDisposable = this.setMessage('Type');

      try {
        const placeholder = await this.askForInitialChar(editor);

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

  private askForInitialChar(editor: TextEditor) {
    return new Promise<PlaceHolder>(async (resolve, reject) => {
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

        const placeholders: PlaceHolder[] = this.placeholderCalculus.buildPlaceholders(
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
            const placeholder = await this.recursivelyJumpTo(
              editor,
              placeholders
            );
            resolve(placeholder);
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
   * creates placeholders in supplied editor and waits for user input for jumping
   * @param editor
   * @param placeholders
   */
  private recursivelyJumpTo(editor: TextEditor, placeholders: PlaceHolder[]) {
    return new Promise<PlaceHolder>(async (resolve, reject) => {
      this.placeHolderDecorator.addDecorations(editor, placeholders);

      const messageDisposable = this.setMessage('Jump To');

      try {
        const char = await new InlineInput().show();
        this.placeHolderDecorator.removeDecorations(editor);

        if (!char) {
          reject(CancelReason.EmptyValue);
          return;
        }

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

  private setMessage(message: string, timeout: number = 0): Disposable {
    return window.setStatusBarMessage(`AceJump: ${message}`, timeout);
  }
}
