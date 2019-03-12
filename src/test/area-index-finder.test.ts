import * as assert from 'assert';

import { AreaIndexFinder } from '../area-index-finder';
import { Config } from '../config/config';
import { JumpArea } from '../models/jump-area';
import { LineIndexes } from '../models/line-indexes';
import { EditorBuilder } from './scenarios/editor.builder';

describe('AreaIndexFinder', () => {
  let sut: AreaIndexFinder;
  let editorBuilder: EditorBuilder;
  let config: Config;

  before(() => {
    editorBuilder = new EditorBuilder();

    sut = new AreaIndexFinder();

    config = new Config();
    sut.refreshConfig(config);
  });

  after(() => {
    editorBuilder.restore();
  });

  describe('findByChar', () => {
    it('should find nothing with no char', () => {
      // given
      const editor = editorBuilder.withLines('my first row').build();

      // when
      const result = sut.findByChar(editor, new JumpArea(0, 0), '');

      // then
      assert.deepEqual(result, {
        count: 0,
        highlightCount: 0,
        indexes: { 0: [] }
      });
    });

    describe('when config has onlyInitialLetter true', () => {
      before(() => {
        config.finder.onlyInitialLetter = true;
        sut.refreshConfig(config);
      });

      it('should find values matching initial letter with given char', () => {
        // given
        const editor = editorBuilder
          .withLines('my first row', 'class a {}', 'myAbsoluteMethod')
          .build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 2), 'a');

        // then
        assert.deepEqual(result, {
          count: 1,
          highlightCount: 0,
          indexes: { 0: [], 1: [6], 2: [] }
        });
      });

      it('should find values matching initial letter with given uppercase char', () => {
        // given
        const editor = editorBuilder.withLines('class a {}').build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 0), 'A');

        // then
        assert.deepEqual(result, {
          count: 1,
          highlightCount: 0,
          indexes: { 0: [6] }
        });
      });

      it('should find values matching initial uppercase letter with given char', () => {
        // given
        const editor = editorBuilder.withLines('class A {}').build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 0), 'a');

        // then
        assert.deepEqual(result, {
          count: 1,
          highlightCount: 0,
          indexes: { 0: [6] }
        });
      });

      it('should skip rows with given area', () => {
        // given
        const editor = editorBuilder
          .withLines('class a {}', 'class a {}', 'class a {}')
          .build();

        // when
        const result = sut.findByChar(editor, new JumpArea(1, 1), 'a');

        // then
        assert.deepEqual(result, {
          count: 1,
          highlightCount: 0,
          indexes: { 1: [6] }
        });
      });

      it('should find values matching initial letter with given char and all config finder pattern', () => {
        // given
        const editor = editorBuilder
          .withLines(`[a ,a -a .a {a _a (a "a 'a <a [a ]a`)
          .build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 0), 'a');

        // then
        assert.deepEqual(result, {
          count: 11,
          highlightCount: 0,
          indexes: { 0: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31] }
        });
      });

      it('should find values matching initial letter with given char with complex example', () => {
        // given
        const editor = editorBuilder
          .withLines(
            `public abstract class my-amazing-class (private absolute: string, public _abs: !Abs)`,
            `{ if(_abs) { return "abs"; else { return 'absolute' } } }`
          )
          .build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 1), 'a');

        // then
        assert.deepEqual(result, {
          count: 7,
          highlightCount: 0,
          indexes: { 0: [7, 25, 48, 74], 1: [6, 21, 42] }
        });
      });
    });

    describe('when config has onlyInitialLetter false', () => {
      before(() => {
        config.finder.onlyInitialLetter = false;
        sut.refreshConfig(config);
      });

      it('should find values matching any letter with given char', () => {
        // given
        const editor = editorBuilder
          .withLines('my first row', 'class a {}', 'myAbsoluteMethod')
          .build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 2), 'a');

        // then
        assert.deepEqual(result, {
          count: 3,
          highlightCount: 0,
          indexes: { 0: [], 1: [2, 6], 2: [2] }
        });
      });

      it('should find values matching any letter with given uppercase char', () => {
        // given
        const editor = editorBuilder.withLines('myabsolutemethod').build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 0), 'A');

        // then
        assert.deepEqual(result, {
          count: 1,
          highlightCount: 0,
          indexes: { 0: [2] }
        });
      });

      it('should find values matching any uppercase letter with given char', () => {
        // given
        const editor = editorBuilder.withLines('myAbsoluteMethod').build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 0), 'a');

        // then
        assert.deepEqual(result, {
          count: 1,
          highlightCount: 0,
          indexes: { 0: [2] }
        });
      });

      it('should skip rows with given area', () => {
        // given
        const editor = editorBuilder
          .withLines('myAbsoluteMethod', 'myAbsoluteMethod', 'myAbsoluteMethod')
          .build();

        // when
        const result = sut.findByChar(editor, new JumpArea(1, 1), 'a');

        // then
        assert.deepEqual(result, {
          count: 1,
          highlightCount: 0,
          indexes: { 1: [2] }
        });
      });

      it('should find values matching any letter with given with complex example', () => {
        // given
        const editor = editorBuilder
          .withLines(
            `public abstract class my-amazing-class (private absolute: string, public _abs: !Abs)`,
            `{ if(_abs) { return "abs"; else { return 'absolute' } } }`
          )
          .build();

        // when
        const result = sut.findByChar(editor, new JumpArea(0, 1), 'a');

        // then
        assert.deepEqual(result, {
          count: 13,
          highlightCount: 0,
          indexes: {
            0: [7, 12, 18, 25, 27, 35, 44, 48, 74, 80],
            1: [6, 21, 42]
          }
        });
      });
    });
  });

  describe('restrictByChar', () => {
    it('should restrict nothing with no char', () => {
      // given
      const editor = editorBuilder.withLines('my first row').build();
      const previousLineIndexes: LineIndexes = {
        count: 1,
        highlightCount: 0,
        indexes: { 0: [0] }
      };

      // when
      const result = sut.restrictByChar(editor, previousLineIndexes, '');

      // then
      assert.deepEqual(result, {
        count: 0,
        highlightCount: 1,
        indexes: { 0: [] }
      });
    });

    it('should not restrict if all indexes have next letter matching the given char', () => {
      // given
      const editor = editorBuilder.withLines('class a cliss b cluss c').build();
      const previousLineIndexes: LineIndexes = {
        count: 3,
        highlightCount: 0,
        indexes: { 0: [0, 8, 16] }
      };

      // when
      const result = sut.restrictByChar(editor, previousLineIndexes, 'l');

      // then
      assert.deepEqual(result, {
        count: 3,
        highlightCount: 1,
        indexes: { 0: [0, 8, 16] }
      });
    });

    it('should restrict and put -1 as index', () => {
      // given
      const editor = editorBuilder.withLines('lass a cliss b luss c').build();
      const previousLineIndexes: LineIndexes = {
        count: 1,
        highlightCount: 0,
        indexes: { 0: [7] }
      };

      // when
      const result = sut.restrictByChar(editor, previousLineIndexes, 'z');

      // then
      assert.deepEqual(result, {
        count: 0,
        highlightCount: 1,
        indexes: { 0: [-1] }
      });
    });

    it('should restrict to one if only index hass next letter matching the given char', () => {
      // given
      const editor = editorBuilder.withLines('lass a liss b luss c').build();
      const previousLineIndexes: LineIndexes = {
        count: 3,
        highlightCount: 0,
        indexes: { 0: [0, 7, 15] }
      };

      // when
      const result = sut.restrictByChar(editor, previousLineIndexes, 'i');

      // then
      assert.deepEqual(result, {
        count: 1,
        highlightCount: 1,
        indexes: { 0: [-1, 7, -1] }
      });
    });
  });
});
