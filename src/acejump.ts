import {
  commands,
  ExtensionContext,
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
          await this.jumper.jump(JumpKind.Normal, false);

          // tslint:disable-next-line:no-empty
        } catch (_) {}
      }),
    );

    context.subscriptions.push(
      commands.registerCommand('extension.aceJump.multiChar', async () => {
        try {
          await this.jumper.jump(JumpKind.MultiChar, false);

          // tslint:disable-next-line:no-empty
        } catch (_) {}
      }),
    );

    context.subscriptions.push(
      commands.registerCommand('extension.aceJump.line', async () => {
        try {
          // if we interrupt a jump (isJumping still true), re-use its selectionMode
          const selectionMode = this.jumper.isJumping ? null : false;
          await this.jumper.jumpToLine(selectionMode);

          // tslint:disable-next-line:no-empty
        } catch (_) {}
      }),
    );

    context.subscriptions.push(
      commands.registerCommand('extension.aceJump.selection', async () => {
        try {
          await this.jumper.jump(JumpKind.Normal, true);

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
