import {
  CancellationTokenSource,
  commands,
  Disposable,
  TextEditor,
  TextEditorEdit,
  window
} from 'vscode';

import { Input } from './models/input';

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
        this.cancel();
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
      if (!!editor) {
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
    if (this.input) {
      this.input.reject(true);
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
