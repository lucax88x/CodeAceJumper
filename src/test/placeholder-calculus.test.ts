import * as assert from 'assert';

import { Config } from '../config/config';
import { Placeholder } from '../models/placeholder';
import { PlaceHolderCalculus } from '../placeholder-calculus';

describe('PlaceHolderCalculus', () => {
  const config = new Config();

  config.characters = ['a', 'b', 'c'];

  const sut = new PlaceHolderCalculus();
  sut.refreshConfig(config);

  describe('Placeholder building Tests', () => {
    describe('with chilrens', () => {
      it('one row with 3 letters give "a b c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 3,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2]
          }
        });

        assert.equal(placeholders.length, 3);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'b');
        assert.equal(placeholders[2].placeholder, 'c');
      });

      it('one row with 4 letters give "a a b c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 4,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2, 3]
          }
        });

        assert.equal(placeholders.length, 4);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'a');
        assert.equal(placeholders[2].placeholder, 'b');
        assert.equal(placeholders[3].placeholder, 'c');
      });

      it('one row with 5 letters give "a a a b c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 5,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2, 3, 4]
          }
        });

        assert.equal(placeholders.length, 5);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'a');
        assert.equal(placeholders[2].placeholder, 'a');
        assert.equal(placeholders[3].placeholder, 'b');
        assert.equal(placeholders[4].placeholder, 'c');
      });

      it('one row with 6 letters give "a a a b b c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 6,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2, 3, 4, 5]
          }
        });

        assert.equal(placeholders.length, 6);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'a');
        assert.equal(placeholders[2].placeholder, 'a');
        assert.equal(placeholders[3].placeholder, 'b');
        assert.equal(placeholders[4].placeholder, 'b');
        assert.equal(placeholders[5].placeholder, 'c');
      });

      it('one row with 7 letters give "a a a b b b c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 7,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2, 3, 4, 5, 6]
          }
        });

        assert.equal(placeholders.length, 7);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'a');
        assert.equal(placeholders[2].placeholder, 'a');
        assert.equal(placeholders[3].placeholder, 'b');
        assert.equal(placeholders[4].placeholder, 'b');
        assert.equal(placeholders[5].placeholder, 'b');
        assert.equal(placeholders[6].placeholder, 'c');
      });

      it('one row with 8 letters give "a a a b b b c c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 8,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2, 3, 4, 5, 6, 7]
          }
        });

        assert.equal(placeholders.length, 8);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'a');
        assert.equal(placeholders[2].placeholder, 'a');
        assert.equal(placeholders[3].placeholder, 'b');
        assert.equal(placeholders[4].placeholder, 'b');
        assert.equal(placeholders[5].placeholder, 'b');
        assert.equal(placeholders[6].placeholder, 'c');
        assert.equal(placeholders[7].placeholder, 'c');
      });

      it('one row with 9 letters give "a a a b b b c c c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 9,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2, 3, 4, 5, 6, 7, 8]
          }
        });

        assert.equal(placeholders.length, 9);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'a');
        assert.equal(placeholders[2].placeholder, 'a');
        assert.equal(placeholders[3].placeholder, 'b');
        assert.equal(placeholders[4].placeholder, 'b');
        assert.equal(placeholders[5].placeholder, 'b');
        assert.equal(placeholders[6].placeholder, 'c');
        assert.equal(placeholders[7].placeholder, 'c');
        assert.equal(placeholders[8].placeholder, 'c');
      });

      it('one row with 10 (overflow) letters give "a a a b b b c c c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 10,
          highlightCount: 0,
          indexes: {
            0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          }
        });

        assert.equal(placeholders.length, 9);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'a');
        assert.equal(placeholders[2].placeholder, 'a');
        assert.equal(placeholders[3].placeholder, 'b');
        assert.equal(placeholders[4].placeholder, 'b');
        assert.equal(placeholders[5].placeholder, 'b');
        assert.equal(placeholders[6].placeholder, 'c');
        assert.equal(placeholders[7].placeholder, 'c');
        assert.equal(placeholders[8].placeholder, 'c');
      });

      it('one row with 3 -1 will give ""', () => {
        const placeholders = sut.buildPlaceholders({
          count: 3,
          highlightCount: 0,
          indexes: {
            0: [-1, -1, -1]
          }
        });

        assert.equal(placeholders.length, 0);
      });

      it('one row with 2 letters and a -1 in the middle will give "a c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 3,
          highlightCount: 0,
          indexes: {
            0: [0, -1, 2]
          }
        });

        assert.equal(placeholders.length, 2);

        assert.equal(placeholders[0].placeholder, 'a');
        assert.equal(placeholders[1].placeholder, 'c');
      });

      it('one row with 2 starting -1 and a final letter will give "c"', () => {
        const placeholders = sut.buildPlaceholders({
          count: 3,
          highlightCount: 0,
          indexes: {
            0: [-1, -1, 2]
          }
        });

        assert.equal(placeholders.length, 1);

        assert.equal(placeholders[0].placeholder, 'c');
      });
    });
  });
  describe.only('Placeholder building holes Tests', () => {
    it('simple holes without highlight', () => {
      const placeholder = new Placeholder();

      const ranges = sut.getPlaceholderHoles(
        [
          { ...placeholder, line: 0, character: 21 },
          { ...placeholder, line: 2, character: 5 }
        ],
        50
      );

      assert.equal(ranges.length, 3);

      assert.equal(ranges[0].start.line, 0);
      assert.equal(ranges[0].start.character, 0);
      assert.equal(ranges[0].end.line, 0);
      assert.equal(ranges[0].end.character, 21);

      assert.equal(ranges[1].start.line, 0);
      assert.equal(ranges[1].start.character, 22);
      assert.equal(ranges[1].end.line, 2);
      assert.equal(ranges[1].end.character, 5);

      assert.equal(ranges[2].start.line, 2);
      assert.equal(ranges[2].start.character, 6);
      assert.equal(ranges[2].end.line, 50);
      assert.equal(ranges[2].end.character, Number.MAX_VALUE);
    });

    it('simple holes with highlight', () => {
      const placeholder = new Placeholder();

      const ranges = sut.getPlaceholderHoles(
        [
          { ...placeholder, line: 0, character: 21 },
          { ...placeholder, line: 2, character: 5 }
        ],
        50,
        5
      );

      assert.equal(ranges.length, 3);

      assert.equal(ranges[0].start.line, 0);
      assert.equal(ranges[0].start.character, 0);
      assert.equal(ranges[0].end.line, 0);
      assert.equal(ranges[0].end.character, 21);

      assert.equal(ranges[1].start.line, 0);
      assert.equal(ranges[1].start.character, 27);
      assert.equal(ranges[1].end.line, 2);
      assert.equal(ranges[1].end.character, 5);

      assert.equal(ranges[2].start.line, 2);
      assert.equal(ranges[2].start.character, 11);
      assert.equal(ranges[2].end.line, 50);
      assert.equal(ranges[2].end.character, Number.MAX_VALUE);
    });
  });
});
