import * as assert from 'assert';

import { Config } from '../config/config';
import { PlaceHolderCalculus } from '../placeholder-calculus';

describe('PlaceHolderCalculus', () => {
  const config = new Config();

  config.characters = ['a', 'b', 'c'];

  const sut = new PlaceHolderCalculus();
  sut.refreshConfig(config);

  describe('Placeholder building Tests', () => {
    it('one row with 3 letters give "a b c"', () => {
      const placeholders = sut.buildPlaceholders({
        count: 3,
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

    it('one row with 10 letters give "a a a b b b c c c"', () => {
      const placeholders = sut.buildPlaceholders({
        count: 10,
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
  });
});
