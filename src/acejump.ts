import {
  commands,
  ExtensionContext,
  Position,
  Selection,
  workspace
} from 'vscode';

import { buildConfig } from './config/config';
import { Jumper } from './jumper';

export class AceJump {
  private jumper = new Jumper();

  public configure(context: ExtensionContext) {
    context.subscriptions.push(
      commands.registerCommand('extension.aceJump', async () => {
        try {
          const { editor, placeholder } = await this.jumper.jump();

          editor.selection = new Selection(
            new Position(placeholder.line, placeholder.character),
            new Position(placeholder.line, placeholder.character)
          );
          // tslint:disable-next-line:no-empty
        } catch (_) {}
      })
    );

    context.subscriptions.push(
      commands.registerCommand('extension.aceJump.selection', async () => {
        try {
          const { editor, placeholder } = await this.jumper.jump();

          editor.selection = new Selection(
            new Position(
              editor.selection.active.line,
              editor.selection.active.character
            ),
            new Position(placeholder.line, placeholder.character)
          );
          // tslint:disable-next-line:no-empty
        } catch (_) {}
      })
    );

    workspace.onDidChangeConfiguration(this.loadConfig);
    this.loadConfig();
  }

  private loadConfig() {
    const config = workspace.getConfiguration('aceJump');

    this.jumper.refreshConfig(buildConfig(config));
  }
}
