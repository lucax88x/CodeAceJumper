import {
  CancellationTokenSource,
  commands,
  Disposable,
  TextEditor,
  TextEditorEdit,
  window
} from 'vscode';

import { Input } from './models/input';
import { CancelReason } from './models/cancel-reason';

export class InlineInput {
  private subscriptions: Disposable[] = [];

  private input: Input;

  constructor() {
    this.registerTextEditorCommand('extension.aceJump.input.stop', this.cancel);
  }

  public async show(): Promise<string> {
    this.setContext(true);

    const promise = new Promise<string>((resolve, reject) => {
      this.input = new Input({
        reject,
        resolve
      });

      window.onDidChangeActiveTextEditor(() => {
        this.cancelWithReason(CancelReason.ChangedActiveEditor);
      });
      window.onDidChangeTextEditorVisibleRanges(() => {
        this.cancelWithReason(CancelReason.ChangedVisibleRanges);
      });
    });

    try {
      this.registerCommand('type', this.onType);
    } catch (e) {
      // Someone has registered `type`, use fallback (Microsoft/vscode#13441)
      const ct = new CancellationTokenSource();
      await window.showInputBox(
        {
          placeHolder: '',
          prompt: 'AceJump ',
          validateInput: s => {
            if (!s) {
              return '';
            }
            this.onType({ text: s });
            ct.cancel();
            return null;
          }
        },
        ct.token
      );

      this.cancel();
    }

    return promise;
  }

  private dispose() {
    this.subscriptions.forEach(d => d.dispose());
  }

  private registerTextEditorCommand(
    commandId: string,
    run: (editor: TextEditor, edit: TextEditorEdit) => void
  ): void {
    this.subscriptions.push(commands.registerTextEditorCommand(commandId, run));
  }

  private registerCommand(
    commandId: string,
    // tslint:disable-next-line:no-any
    run: (...args: any[]) => void
  ): void {
    this.subscriptions.push(commands.registerCommand(commandId, run));
  }

  private onType = (event: { text: string }) => {
    const editor = window.activeTextEditor;

    if (this.input) {
      if (!!editor && event.text !== 'escape') {
        this.input.text += event.text;
        this.complete();
      } else {
        this.cancel();
      }
    } else {
      commands.executeCommand('default:type', event);
    }
  };

  private cancel = () => {
    this.cancelWithReason(CancelReason.Cancel);
  };

  private cancelWithReason = (cancelReason: CancelReason) => {
    if (this.input) {
      this.input.reject(cancelReason);
    }
    this.dispose();
    this.setContext(false);
  };

  private complete() {
    if (this.input) {
      this.input.resolve(this.input.text);
    }
    this.dispose();
    this.setContext(false);
  }

  private setContext(value: boolean) {
    commands.executeCommand('setContext', 'aceJumpInput', value);
  }
}
