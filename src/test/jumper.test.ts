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

  describe('both jumpkinds', () => {
    // it('when we finish a jump we should be able to recall it', async () => {
    //   // given
    //   scenario.withLines('this absolutely match').withCommand('a');
    //   await sut.jump(JumpKind.Normal);

    //   // when
    //   await sut.jump(JumpKind.Normal);
    // });

    [JumpKind.Normal, JumpKind.MultiChar].forEach(jumpKind => {
      it(`should not jump when there is no editor for ${jumpKind}`, async () => {
        // given
        scenario.withNoEditor();

        try {
          // when
          await sut.jump(jumpKind);

          throw new Error('should have thrown exception');
        } catch (error) {
          // then
          assert.equal(error.message, 'No active editor');

          scenario.hasStatusBarMessages();
        }
      });

      it(`should not jump if input is empty for ${jumpKind}`, async () => {
        // given
        scenario.withEditor().withCommands('');

        try {
          // when
          await sut.jump(jumpKind);

          throw new Error('should have thrown exception');
        } catch (error) {
          // then
          assert.equal(error.message, 'Empty Value');

          scenario.hasStatusBarMessages(
            '$(rocket) Type',
            '$(rocket) Empty Value'
          );
        }
      });

      it(`should break if there is no visibleRanges for ${jumpKind}`, async () => {
        // given
        scenario.withNoVisibleRanges().withCommands('a');

        try {
          // when
          await sut.jump(jumpKind);

          throw new Error('should have thrown exception');
        } catch (error) {
          // then
          assert.equal(error.message, 'There are no visible ranges!');

          scenario.hasStatusBarMessages('$(rocket) Type', '$(rocket) Canceled');
        }
      });

      it(`should break if there is one row which does not match the char for ${jumpKind}`, async () => {
        // given
        scenario.withLines('no matching characters').withCommands('a');

        try {
          // when
          await sut.jump(jumpKind);

          throw new Error('should have thrown exception');
        } catch (error) {
          // then
          assert.equal(error.message, 'No Matches');

          scenario.hasStatusBarMessages('$(rocket) Type', '$(rocket) No Matches');
        }
      });

      it(`should jump directly if there is three row where matches only one for ${jumpKind}`, async () => {
        // given
        scenario
          .withLines('my first row', 'this absolutely match', 'class some')
          .withCommands('a');

        // when
        const { placeholder } = await sut.jump(jumpKind);

        // then
        assert.deepEqual(placeholder, {
          childrens: [],
          index: 0,
          placeholder: 'a',
          line: 2,
          character: 5
        });

        scenario.hasStatusBarMessages('$(rocket) Type', '$(rocket) Jumped!');
      });
    });
  });

  describe(`${JumpKind.Normal} jumpkind`, () => {
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
          '$(rocket) Type',
          '$(rocket) Jump To',
          '$(rocket) Empty Value'
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
          '$(rocket) Type',
          '$(rocket) Jump To',
          '$(rocket) No Matches'
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
      scenario.hasDimmedEditor(2);
      scenario.hasCreatedPlaceholders(3);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 1,
        placeholder: 'b',
        line: 3,
        character: 0
      });

      scenario.hasStatusBarMessages(
        '$(rocket) Type',
        '$(rocket) Jump To',
        '$(rocket) Jumped!'
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
      scenario.hasDimmedEditor(3);
      scenario.hasCreatedPlaceholders(80);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 5,
        placeholder: 'f',
        line: 3,
        character: 10
      });

      scenario.hasStatusBarMessages(
        '$(rocket) Type',
        '$(rocket) Jump To',
        '$(rocket) Jump To',
        '$(rocket) Jumped!'
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
      scenario.hasDimmedEditor(2);
      scenario.hasCreatedPlaceholders(3);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 1,
        placeholder: 'b',
        line: 3,
        character: 0
      });

      scenario.hasStatusBarMessages(
        '$(rocket) Type',
        '$(rocket) Jump To',
        '$(rocket) Jumped!'
      );
    });
  });

  describe(`${JumpKind.MultiChar} jumpkind`, () => {
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
        await sut.jump(JumpKind.MultiChar);

        throw new Error('should have thrown exception');
      } catch (error) {
        // then
        assert.equal(error.message, 'Empty Value');

        scenario.hasStatusBarMessages(
          '$(rocket) Type',
          '$(rocket) Next char',
          '$(rocket) Empty Value'
        );
      }
    });

    it(`
    should jump directly to first placeholder when
    there is three row where matches three and we restrict to a valid next char`, async () => {
      // given
      scenario
        .withLines(
          'my first row',
          'this absolutely match',
          'also this is also matching'
        )
        .withCommands(
          'a', // we try to match a
          'b', // we try to match second char
          'escape', // we escape
          'a' // we try to jump to placeholder
        );

      // when
      const { placeholder } = await sut.jump(JumpKind.MultiChar);

      // then
      scenario.hasDimmedEditor(2);
      scenario.hasCreatedPlaceholders(6);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 0,
        placeholder: 'a',
        line: 2,
        character: 5
      });

      scenario.hasStatusBarMessages(
        '$(rocket) Type',
        '$(rocket) Next char',
        '$(rocket) Jumped!'
      );
    });

    it(`
      should preserve placeholders and jump to correct placeholder
      when there is three row where matches three
      but we restrict with a non-matching char until we press a valid next char
      `, async () => {
      // given
      scenario
        .withLines(
          'my first row',
          'this absolutely match',
          'also this is also matching'
        )
        .withCommands(
          'a', // we try to match a
          'z', // non matching restrict char
          'f', // non matching restrict char
          'l', // we try to match second char
          'escape', // we escape
          'b' // we try to jump to placeholder
        );

      // when
      const { placeholder } = await sut.jump(JumpKind.MultiChar);

      // then
      scenario.hasDimmedEditor(6);
      scenario.hasCreatedPlaceholders(24);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 1,
        placeholder: 'b',
        line: 3,
        character: 0
      });

      scenario.hasStatusBarMessages(
        '$(rocket) Type',
        '$(rocket) Next char',
        '$(rocket) Next char',
        '$(rocket) Next char',
        '$(rocket) Next char',
        '$(rocket) Jump To',
        '$(rocket) Jumped!'
      );
    });

    it(`
      shoud jump to matched placeholder directly even without escaping
      when there is three row where matches three
      but we restrict with a non-matching char but which matches a placeholder
      `, async () => {
      // given
      scenario
        .withLines(
          'my first row',
          'this absolutely match',
          'also this is also matching'
        )
        .withCommands(
          'a', // we try to match a
          'l', // we restrict with l
          'c' // we jump to placeholder c
        );

      // when
      const { placeholder } = await sut.jump(JumpKind.MultiChar);

      // then
      scenario.hasDimmedEditor(3);
      scenario.hasCreatedPlaceholders(10);

      assert.deepEqual(placeholder, {
        childrens: [],
        index: 2,
        placeholder: 'c',
        line: 3,
        character: 13
      });

      scenario.hasStatusBarMessages(
        '$(rocket) Type',
        '$(rocket) Next char',
        '$(rocket) Next char',
        '$(rocket) Jumped!'
      );
    });
  });
});
