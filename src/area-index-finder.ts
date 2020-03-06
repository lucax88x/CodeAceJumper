import { filter, keys, map } from 'ramda';
import { TextEditor } from 'vscode';

import { Config } from './config/config';
import { JumpArea } from './models/jump-area';
import { LineIndexes } from './models/line-indexes';

export class AreaIndexFinder {
  private config: Config;

  public refreshConfig(config: Config) {
    this.config = config;
  }

  /**
   * find indexes for each line where our char is matching
   * @param editor
   * @param area
   * @param char
   */
  public findByChar(
    editor: TextEditor,
    area: JumpArea,
    char: string
  ): LineIndexes {
    const lineIndexes = new LineIndexes();

    for (const areaLine of area.lines) {
      for (let i = areaLine[0]; i <= areaLine[1]; i++) {
        const line = editor.document.lineAt(i);
        const indexes = this.findByCharOnGivenLine(line.text, char);

        lineIndexes.count += indexes.length;
        lineIndexes.indexes[i] = indexes;
      }
    }

    return lineIndexes;
  }

  /**
   * will recompute indexes by usind previous one where our char is matching
   * @param editor
   * @param previousLineIndexes
   * @param char
   */
  public restrictByChar(
    editor: TextEditor,
    previousLineIndexes: LineIndexes,
    char: string
  ): LineIndexes {
    const lineIndexes = new LineIndexes();

    if (previousLineIndexes.count === 0) {
      return lineIndexes;
    }

    lineIndexes.highlightCount = previousLineIndexes.highlightCount + 1;

    const lines = keys(previousLineIndexes.indexes) as string[];

    for (const lineIndex of lines) {
      const line = editor.document.lineAt(parseInt(lineIndex, 10));
      const indexes = this.restrictByCharOnGivenLine(
        line.text,
        previousLineIndexes.indexes[lineIndex],
        char,
        lineIndexes.highlightCount
      );

      lineIndexes.count += filter(i => i !== -1, indexes).length;
      lineIndexes.indexes[lineIndex] = indexes;
    }

    return lineIndexes;
  }


  /**
   * find indexes for each line
   * @param editor
   * @param area
   */
  public findByLines(
    editor: TextEditor,
    area: JumpArea
  ): LineIndexes {
    const lineIndexes = new LineIndexes();

    for (const areaLine of area.lines) {
      for (let i = areaLine[0]; i <= areaLine[1]; i++) {
        const endIndex = editor.document.lineAt(i).range.end.character;
        if (this.config.finder.jumpToLineEndings && endIndex > 0) {
          lineIndexes.count = 2;
          // add beginning and end of line
          lineIndexes.indexes[i] = [0, endIndex];
        } else {
          lineIndexes.count = 1;
          // always first visible character!
          lineIndexes.indexes[i] = [0];
        }
      }
    }

    return lineIndexes;
  }

  /**
   * find indexes on the line where our char is matching
   * @param line
   * @param char
   */
  private findByCharOnGivenLine(line: string, char: string): number[] {
    if (char.length === 0) {
      return [];
    }

    char = char.toLowerCase();

    const indexes = [];
    const finderPatternRegex = new RegExp(this.config.finder.pattern);

    if (
      this.config.finder.onlyInitialLetter &&
      !finderPatternRegex.test(char)
    ) {
      // current line index
      let index = 0;

      // splitted by the pattern
      const words = line.split(finderPatternRegex);

      for (let w = 0; w < words.length; w++) {
        if (words[w][0] && words[w][0].toLowerCase() === char) {
          indexes.push(index);
        }

        // increment by whole line and white space
        index += words[w].length + 1;
      }
    } else {
      const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexp = new RegExp(escapedChar, 'gi');
      let match: RegExpMatchArray | null;
      // tslint:disable-next-line:no-conditional-assignment
      while ((match = regexp.exec(line)) !== null) {
        if (match.index !== undefined) {
          indexes.push(match.index);
        }
      }
    }

    return indexes;
  }

  /**
   * restrict indexes by detecting if next char is matching for each occurrence with our char
   * @param line
   * @param char
   */
  private restrictByCharOnGivenLine(
    line: string,
    previousIndexes: number[],
    char: string,
    skipCount: number
  ): number[] {
    if (char.length === 0) {
      return [];
    }

    char = char.toLowerCase();

    return map(charIndex => {
      const letter = line[charIndex + skipCount];
      if (letter && letter.toLowerCase() === char) {
        return charIndex;
      } else {
        return -1;
      }
    }, previousIndexes);
  }
}
