import * as assert from 'assert';

import { Config } from '../config/config';
import { JumpKind } from '../models/jump-kind';
import { Jumper } from './../jumper';
import { ScenarioBuilder } from './scenarios/scenario.builder';

describe('Jumper', () => {
  let sut: Jumper;
  let scenario: ScenarioBuilder;

  before(() => {
    sut = new Jumper();

    const config = new Config();
    sut.refreshConfig(config);

    scenario = new ScenarioBuilder();
  });

  after(() => {
    scenario.restore();
  });

  afterEach(() => {
    scenario.reset();
  });

  describe('normal jump', () => {
    // it('when we finish a jump we should be able to recall it', async () => {
    //   // given
    //   scenario.withLines('this absolutely match').withCommand('a');
    //   await sut.jump(JumpKind.Normal);

    //   // when
    //   await sut.jump(JumpKind.Normal);
    // });

    it('should not jump when there is no editor', async () => {
      // given
      scenario.withNoEditor();

      try {
        // when
        await sut.jump(JumpKind.Normal);

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'No active editor');

        scenario.hasStatusBarMessages();
      }
    });

    it('should not jump if input is empty', async () => {
      // given
      scenario.withEditor().withCommands('');

      try {
        // when
        await sut.jump(JumpKind.Normal);

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'Empty Value');

        scenario.hasStatusBarMessages('AceJump: Type', 'AceJump: Empty Value');
      }
    });

    it('should break if there is no visibleRanges', async () => {
      // given
      scenario.withNoVisibleRanges().withCommands('a');

      try {
        // when
        await sut.jump(JumpKind.Normal);

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'There are no visible ranges!');

        scenario.hasStatusBarMessages('AceJump: Type', 'AceJump: Canceled');
      }
    });

    it('should break if there is one row which does not match the char', async () => {
      // given
      scenario.withLines('no matching characters').withCommands('a');

      try {
        // when
        await sut.jump(JumpKind.Normal)

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'No Matches');

        scenario.hasStatusBarMessages('AceJump: Type', 'AceJump: No Matches');
      }
    });

    it('should jump directly if there is three row where matches only one', async () => {
      // given
      scenario
        .withLines('my first row', 'this absolutely match', 'class some')
        .withCommands('a');

      // when
      const { placeholder } = await sut.jump(JumpKind.Normal);

      // then
      assert.deepEqual(placeholder, {
        childrens: [],
        index: 0,
        highlight: 0,
        placeholder: 'a',
        line: 2,
        character: 5
      });

      scenario.hasStatusBarMessages('AceJump: Type', 'AceJump: Jumped!');
    });

    it('should not jump if there is three row where matches three but we type empty value', async () => {
      // given
      scenario
        .withLines(
          'my first row',
          'this absolutely match',
          'also this is also matching'
        )
        .withCommands('a', '');

      try {
        // when
        await sut.jump(JumpKind.Normal);

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'Empty Value');

        scenario.hasStatusBarMessages(
          'AceJump: Type',
          'AceJump: Jump To',
          'AceJump: Empty Value'
        );
      }
    });

    it('should not jump if there is three row where matches three but we type a non matching placeholder', async () => {
      // given
      scenario
        .withLines(
          'my first row',
          'this absolutely match',
          'also this is also matching'
        )
        .withCommands('a', 'd');

      try {
        // when
        await sut.jump(JumpKind.Normal);

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'No Matches');

        scenario.hasStatusBarMessages(
          'AceJump: Type',
          'AceJump: Jump To',
          'AceJump: No Matches'
        );
      }
    });

    it('should jump if there is three row where matches three and we match a placeholder', async () => {
      // given
      scenario
        .withLines(
          'my first row',
          'this absolutely match',
          'also this is also matching'
        )
        .withCommands('a', 'b');

      // when
      const { placeholder } = await sut.jump(JumpKind.Normal);

      // then
      scenario.hasCreatedPlaceholders(3);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 1,
        highlight: 0,
        placeholder: 'b',
        line: 3,
        character: 0
      });

      scenario.hasStatusBarMessages(
        'AceJump: Type',
        'AceJump: Jump To',
        'AceJump: Jumped!'
      );
    });

    it('should jump if there is more than available characters and we have to jump twice', async () => {
      // given
      scenario
        .withLines(
          'a a a a a a a a a a a a a',
          'a a a a a a a a a a a a a',
          'a a a a a a a a a a a a a',
          'a a a a a a a a a a a a a',
          'a a a a a a a a a a a a a'
        )
        .withCommands('a', 'b', 'f');

      // when
      const { placeholder } = await sut.jump(JumpKind.Normal);

      // then
      scenario.hasCreatedPlaceholders(80);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 5,
        highlight: 0,
        placeholder: 'f',
        line: 3,
        character: 10
      });

      scenario.hasStatusBarMessages(
        'AceJump: Type',
        'AceJump: Jump To',
        'AceJump: Jump To',
        'AceJump: Jumped!'
      );
    });

    it('should jump if there is three row where matches three', async () => {
      // given
      scenario
        .withLines(
          'my first row',
          'this absolutely match',
          'also this is also matching'
        )
        .withCommands('a', 'b');

      // when
      const { placeholder } = await sut.jump(JumpKind.Normal);

      // then
      scenario.hasCreatedPlaceholders(3);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 1,
        highlight: 0,
        placeholder: 'b',
        line: 3,
        character: 0
      });

      scenario.hasStatusBarMessages(
        'AceJump: Type',
        'AceJump: Jump To',
        'AceJump: Jumped!'
      );
    });
  });
});
