import { filter, head, last, reject } from 'ramda';
import forEach from 'ramda/es/forEach';

import { Config } from './config/config';
import { LineIndexes } from './models/line-indexes';
import { PlaceHolder } from './models/place-holder';

export class PlaceHolderCalculus {
  private config: Config;

  public load(config: Config) {
    this.config = config;
  }

  public buildPlaceholders(lineIndexes: LineIndexes): PlaceHolder[] {
    const placeholders: PlaceHolder[] = [];
    let count = 0;
    let candidate = 1;
    const map: PlaceHolder[][] = [];
    let breakCycles = false;

    for (const key in lineIndexes.indexes) {
      if (lineIndexes.hasOwnProperty(key)) {
        continue;
      }
      const line = parseInt(key, 10);
      const lineIndex = lineIndexes.indexes[key];

      for (const i of lineIndex) {
        if (count + 1 > Math.pow(this.config.characters.length, 2)) {
          breakCycles = true;
          break;
        }

        const character = lineIndex[i];

        if (count >= this.config.characters.length) {
          for (let y = candidate; y < placeholders.length; y++) {
            const movingPlaceholder = placeholders[y];

            const previousIndex = movingPlaceholder.index - 1;

            if (map[previousIndex].length < this.config.characters.length) {
              map[movingPlaceholder.index] = reject(
                item => item === movingPlaceholder,
                map[movingPlaceholder.index]
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

        const placeholder = new PlaceHolder();

        placeholder.index = 0;

        const lastPlaceholder = last(placeholders);

        if (!!lastPlaceholder) {
          placeholder.index = lastPlaceholder.index + 1;
        }

        if (placeholder.index >= this.config.characters.length) {
          placeholder.index = this.config.characters.length - 1;
        }

        placeholder.placeholder = this.config.characters[placeholder.index];

        placeholder.line = line;
        placeholder.character = character;

        if (!map[placeholder.index]) {
          map[placeholder.index] = [];
        }

        placeholders.push(placeholder);
        map[placeholder.index].push(placeholder);

        count++;
      }

      if (breakCycles) {
        break;
      }
    }

    // we assign root to other placeholders

    const mapWithMultipleItems = filter(item => item.length > 1, map);

    forEach(mappedPlaceholders => {
      const root = head(mappedPlaceholders);

      if (!root) {
        return;
      }

      for (let y = 0; y < mappedPlaceholders.length; y++) {
        const mappedPlaceholder: PlaceHolder = mappedPlaceholders[y];

        // first mappedPlaceholder is the root!
        if (y > 0) {
          mappedPlaceholder.root = root;
        }

        const placeholder = new PlaceHolder();

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
}
