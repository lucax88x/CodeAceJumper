import * as assert from 'assert';
import { filter, map, sum } from 'ramda';
import * as sinon from 'sinon';
import { commands, DecorationOptions, Range, TextEditor, window } from 'vscode';

import { RecursivePartial } from '../recursive-partial';

export class ScenarioBuilder {
  private sandbox: sinon.SinonSandbox;
  private inputStub: sinon.SinonStub;
  private commandsStub: sinon.SinonStub;
  private editorStub: sinon.SinonStub;
  private statusSpy: sinon.SinonSpy;
  private createDecorationSpy: sinon.SinonSpy;
  private setDecorationsSpy: sinon.SinonSpy;
  private editorMock: RecursivePartial<TextEditor> | undefined;

  constructor() {
    this.sandbox = sinon.createSandbox();
    this.inputStub = this.sandbox.stub(window, 'showInputBox');
    this.commandsStub = this.sandbox.stub(commands, 'registerCommand');
    this.editorStub = this.sandbox
      .stub(window, 'activeTextEditor')
      .get(() => this.editorMock);

    this.statusSpy = this.sandbox.spy(window, 'setStatusBarMessage');
    this.createDecorationSpy = this.sandbox.spy(
      window,
      'createTextEditorDecorationType'
    );
  }

  public restore() {
    this.sandbox.restore();
  }

  public reset() {
    this.editorStub.reset();
    this.commandsStub.reset();
    this.inputStub.reset();
    this.statusSpy.resetHistory();
    this.createDecorationSpy.resetHistory();

    if (!!this.setDecorationsSpy) {
      this.setDecorationsSpy.resetHistory();
    }
  }

  public withNoEditor() {
    this.editorMock = undefined;
    return this;
  }

  public withEditor() {
    this.editorMock = {
      document: {
        lineCount: 0
      },
      setDecorations: this.setDecorationsSpy = this.sandbox.spy()
    };
    return this;
  }

  public withNoVisibleRanges() {
    this.editorMock = {
      selection: {
        isEmpty: true
      },
      document: {
        lineCount: 0
      },
      setDecorations: this.setDecorationsSpy = this.sandbox.spy(),
      visibleRanges: []
    };
    return this;
  }

  public withLines(...lines: string[]) {
    const lineAtMock = sinon.stub();

    for (let i = 0; i < lines.length; i++) {
      lineAtMock.withArgs(i + 1).returns({ text: lines[i] });
    }

    this.editorMock = {
      selection: {
        isEmpty: true
      },
      visibleRanges: [{ start: { line: 1 }, end: { line: lines.length } }],
      document: {
        getText: () => 'my long text',
        lineAt: lineAtMock,
        lineCount: lines.length
      },
      setDecorations: this.setDecorationsSpy = this.sandbox.spy()
    };
    return this;
  }

  public withCommands(...texts: string[]) {
    let i = 0;
    this.commandsStub.callsFake((_, callback) => {
      if (texts.length - 1 < i) {
        throw new Error('called more commands than expected');
      }
      callback({ text: texts[i++] });
    });

    return this;
  }

  public hasCreatedPlaceholders(count: number) {
    const notRemoveDecorationCalls = filter<SinonCall>(
      call => call.args[1].length !== 0
    );
    // dim is called setting only ranges and no options
    const dimDecorationCalls = filter<SinonCall>(call =>
      call.args[1][0].hasOwnProperty('range')
    );

    const sumCalls = dimDecorationCalls(
      notRemoveDecorationCalls(this.setDecorationsSpy.getCalls())
    );

    const createdPlaceholders = sum(map(c => c.args[1].length, sumCalls));

    assert.equal(createdPlaceholders, count);
  }

  public hasDimmedEditor(count: number) {
    const notRemoveDecorationCalls = filter<SinonCall>(
      call => call.args[1].length !== 0
    );
    // dim is called setting only ranges and no options
    const nonDimDecorationCalls = filter<SinonCall>(
      call => !call.args[1][0].hasOwnProperty('range')
    );

    const dimmedCalls = nonDimDecorationCalls(
      notRemoveDecorationCalls(this.setDecorationsSpy.getCalls())
    );

    assert.equal(dimmedCalls.length, count);
  }

  public hasStatusBarMessages(...statuses: string[]) {
    const allArgs = map(call => call.args[0], this.statusSpy.getCalls());

    assert.deepEqual(statuses, allArgs, `${statuses} did not match ${allArgs}`);
  }
}

interface SinonCall {
  args: Array<Range[] | DecorationOptions[]>;
}
