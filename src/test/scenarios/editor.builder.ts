import * as sinon from 'sinon';
import { TextEditor } from 'vscode';

import { RecursivePartial } from '../recursive-partial';

export class EditorBuilder {
  private sandbox: sinon.SinonSandbox;
  private editorMock: RecursivePartial<TextEditor> | undefined;

  constructor() {
    this.sandbox = sinon.createSandbox();
  }

  public restore() {
    this.sandbox.restore();
  }

  public withLines(...lines: string[]) {
    const lineAtMock = sinon.stub();

    for (let i = 0; i < lines.length; i++) {
      lineAtMock.withArgs(i).returns({ text: lines[i] });
    }

    this.editorMock = {
      document: {
        lineAt: lineAtMock,
        lineCount: lines.length
      }
    };
    return this;
  }

  public build(): TextEditor {
    return (this.editorMock as unknown) as TextEditor;
  }
}
