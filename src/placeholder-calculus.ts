import { filter, forEach, head, last, reject } from 'ramda';
import { Position, Range } from 'vscode';

import { Config } from './config/config';
import { LineIndexes } from './models/line-indexes';
import { Placeholder } from './models/placeholder';

export class PlaceHolderCalculus {
  private config: Config;

  public refreshConfig(config: Config) {
    this.config = config;
  }

  public buildPlaceholders(lineIndexes: LineIndexes): Placeholder[] {
    const placeholders: Placeholder[] = [];
    let count = 0;
    let skip = 0;
    let candidate = 1;
    const map: Placeholder[][] = [];
    let breakCycles = false;

    for (const key in lineIndexes.indexes) {
      if (!lineIndexes.indexes.hasOwnProperty(key)) {
        continue;
      }
      const line = parseInt(key, 10);
      const lineIndex = lineIndexes.indexes[key];

      if (!lineIndex) {
        continue;
      }

      for (let i = 0; i < lineIndex.length; i++) {
        if (count + 1 > Math.pow(this.config.characters.length, 2)) {
          breakCycles = true;
          break;
        }

        const characterIndex = lineIndex[i];

        if (count >= this.config.characters.length) {
          for (let y = candidate; y < placeholders.length; y++) {
            const movingPlaceholder = placeholders[y];

            const previousIndex = movingPlaceholder.index - 1;

            if (!map[previousIndex]) {
              continue;
            }

            if (map[previousIndex].length < this.config.characters.length) {
              map[movingPlaceholder.index] = reject(
                item => item === movingPlaceholder,
                map[movingPlaceholder.index],
              );

              movingPlaceholder.index = previousIndex;

              map[movingPlaceholder.index].push(movingPlaceholder);
            }

            movingPlaceholder.placeholder = this.config.characters[
              movingPlaceholder.index
            ];
          }
          candidate++;
        }

        const placeholder = new Placeholder();

        if (characterIndex === -1) {
          skip++;
        } else {
          const lastPlaceholder = last(placeholders);

          if (!!lastPlaceholder) {
            placeholder.index = lastPlaceholder.index + 1;
          }

          // increase index by previous skipped
          placeholder.index += skip;
          skip = 0;

          // imho can be removed and should throw exception in case?
          if (placeholder.index >= this.config.characters.length) {
            placeholder.index = this.config.characters.length - 1;
          }

          placeholder.placeholder = this.config.characters[placeholder.index];

          placeholder.line = line;
          placeholder.character = characterIndex;

          if (!map[placeholder.index]) {
            map[placeholder.index] = [];
          }

          placeholders.push(placeholder);
          map[placeholder.index].push(placeholder);
        }

        count++;
      }

      if (breakCycles) {
        break;
      }
    }

    // we assign root to other placeholders

    const mapWithMultipleItems = filter(item => !!item && item.length > 1, map);

    forEach(mappedPlaceholders => {
      const root = head(mappedPlaceholders);

      if (!root) {
        return;
      }

      for (let y = 0; y < mappedPlaceholders.length; y++) {
        const mappedPlaceholder: Placeholder = mappedPlaceholders[y];

        // first mappedPlaceholder is the root!
        if (y > 0) {
          mappedPlaceholder.root = root;
        }

        const placeholder = new Placeholder();

        placeholder.index = y;
        placeholder.placeholder = this.config.characters[placeholder.index];

        placeholder.line = mappedPlaceholder.line;
        placeholder.character = mappedPlaceholder.character;

        // add a copy of placeholder as children of root
        root.childrens.push(placeholder);
      }
    }, mapWithMultipleItems);

    return placeholders;
  }

  public getPlaceholderHoles(
    placeholders: Placeholder[],
    lineCount: number,
    highlightCount = -1,
  ): Range[] {
    const ranges: Range[] = [];
    let previousLine = 0;
    let previousCharacter = -1;
    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i];

      ranges.push(
        new Range(
          new Position(previousLine, previousCharacter + 1),
          new Position(placeholder.line, placeholder.character),
        ),
      );

      previousLine = placeholder.line;
      previousCharacter =
        placeholder.character + (highlightCount === -1 ? 0 : highlightCount);
    }

    ranges.push(
      new Range(
        new Position(previousLine, previousCharacter + 1),
        new Position(lineCount, Number.MAX_VALUE),
      ),
    );

    return ranges;
  }
}
