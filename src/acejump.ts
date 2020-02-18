import {
  commands,
  ExtensionContext,
  Position,
  Selection,
  workspace,
} from 'vscode';
import { buildConfig } from './config/config';
import { Jumper } from './jumper';
import { JumpKind } from './models/jump-kind';

export class AceJump {
  private jumper = new Jumper();

  public configure(context: ExtensionContext) {
    context.subscriptions.push(
      commands.registerCommand('extension.aceJump', async () => {
        try {
          const { editor, placeholder } = await this.jumper.jump(
            JumpKind.Normal,
          );

          editor.selection = new Selection(
            new Position(placeholder.line, placeholder.character),
            new Position(placeholder.line, placeholder.character),
          );

          await this.jumper.scrollToLine(placeholder.line);

          // tslint:disable-next-line:no-empty
        } catch (_) {}
      }),
    );

    context.subscriptions.push(
      commands.registerCommand('extension.aceJump.multiChar', async () => {
        try {
          const { editor, placeholder } = await this.jumper.jump(
            JumpKind.MultiChar,
          );

          editor.selection = new Selection(
            new Position(placeholder.line, placeholder.character),
            new Position(placeholder.line, placeholder.character),
          );

          await this.jumper.scrollToLine(placeholder.line);

          // tslint:disable-next-line:no-empty
        } catch (_) {}
      }),
    );

      context.subscriptions.push(
        commands.registerCommand('extension.aceJump.line', async () => {
          try {
            const { editor, placeholder } = await this.jumper.jumpToLine();
  
            editor.selection = new Selection(
              new Position(placeholder.line, placeholder.character),
              new Position(placeholder.line, placeholder.character),
            );
  
            await this.jumper.scrollToLine(placeholder.line);
  
            // tslint:disable-next-line:no-empty
          } catch (_) {}
        }),
      );

    context.subscriptions.push(
      commands.registerCommand('extension.aceJump.selection', async () => {
        try {
          const { editor, placeholder } = await this.jumper.jump(
            JumpKind.Normal,
          );

          editor.selection = new Selection(
            new Position(
              editor.selection.active.line,
              editor.selection.active.character,
            ),
            new Position(placeholder.line, placeholder.character + 1),
          );

          await this.jumper.scrollToLine(placeholder.line);

          // tslint:disable-next-line:no-empty
        } catch (_) {}
      }),
    );

    workspace.onDidChangeConfiguration(this.loadConfig);
    this.loadConfig();
  }

  private loadConfig = () => {
    const config = workspace.getConfiguration('aceJump');

    this.jumper.refreshConfig(buildConfig(config));
  };
}
