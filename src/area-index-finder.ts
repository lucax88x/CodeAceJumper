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
    const lineIndexes: LineIndexes = {
      count: 0,
      indexes: {}
    };

    for (let i = area.startLine; i <= area.lastLine; i++) {
      const line = editor.document.lineAt(i);
      const indexes = this.findByCharOnGivenLine(line.text, char);

      lineIndexes.count += indexes.length;
      lineIndexes.indexes[i] = indexes;
    }

    return lineIndexes;
  }

  /**
   * find indexes on the line where our char is matching
   * @param str
   * @param char
   */
  private findByCharOnGivenLine(str: string, char: string): number[] {
    if (char.length === 0) {
      return [];
    }

    char = char.toLowerCase();

    const indices = [];
    const finderPatternRegex = new RegExp(this.config.finder.pattern);

    if (
      this.config.finder.onlyInitialLetter &&
      !finderPatternRegex.test(char) // what is purpose of this?
    ) {
      // current line index
      let index = 0;

      // splitted by the pattern
      const words = str.split(finderPatternRegex);

      for (let w = 0; w < words.length; w++) {
        if (words[w][0] && words[w][0].toLowerCase() === char) {
          indices.push(index);
        }

        // increment by whole line and white space
        index += words[w].length + 1;
      }
    } else {
      const regexp = new RegExp(`[${char}]`, 'gi');
      let match: RegExpMatchArray | null;
      // tslint:disable-next-line:no-conditional-assignment
      while ((match = regexp.exec(str)) !== null) {
        if (match.index !== undefined) {
          indices.push(match.index);
        }
      }
    }

    return indices;
  }
}
