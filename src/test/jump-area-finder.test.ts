import * as assert from 'assert';
import * as sinon from 'sinon';
import { TextEditor } from 'vscode';

import { Config } from '../config/config';
import { JumpAreaFinder } from './../jump-area-finder';
import { RecursivePartial } from './recursive-partial';

describe('JumpAreaFinder', () => {
  let sut: JumpAreaFinder;
  let sandbox: sinon.SinonSandbox;
  let editorMock: RecursivePartial<TextEditor>;

  before(() => {
    sandbox = sinon.createSandbox();

    sut = new JumpAreaFinder();

    const config = new Config();
    sut.refreshConfig(config);
  });

  after(() => {
    sandbox.restore();
  });

  describe('when user has selection', () => {
    it('should grab correct values when selection anchor is higher than selection active', () => {
      // given
      editorMock = {
        selection: {
          isEmpty: false,
          anchor: { line: 5 },
          active: { line: 15 }
        }
      };

      // when
      const result = sut.findArea((editorMock as unknown) as TextEditor);

      // then
      assert.deepEqual(result, {
        lines: [[5, 15]]
      });
    });

    it('should grab correct values when selection anchor is lower than selection active', () => {
      // given
      editorMock = {
        selection: {
          isEmpty: false,
          anchor: { line: 15 },
          active: { line: 5 }
        }
      };

      // when
      const result = sut.findArea((editorMock as unknown) as TextEditor);

      // then
      assert.deepEqual(result, {
        lines: [[5, 15]]
      });
    });
  });

  describe('when user has no selection', () => {
    it('should throw if no visible range', () => {
      // given
      editorMock = {
        selection: { isEmpty: true },
        visibleRanges: []
      };

      try {
        // when
        sut.findArea((editorMock as unknown) as TextEditor);

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'There are no visible ranges!');
      }
    });

    it('should get first visible range', () => {
      // given
      editorMock = {
        selection: { isEmpty: true },
        visibleRanges: [
          {
            start: { line: 5 },
            end: { line: 10 }
          }
        ]
      };

      // when
      const result = sut.findArea((editorMock as unknown) as TextEditor);

      // then
      assert.deepEqual(result, {
        lines: [[5, 10]]
      });
    });
  });
});
