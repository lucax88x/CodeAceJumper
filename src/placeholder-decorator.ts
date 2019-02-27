import { forEach, map } from 'ramda';
import {
  Range,
  TextEditor,
  TextEditorDecorationType,
  Uri,
  window
} from 'vscode';
import * as builder from 'xmlbuilder';

import { Config } from './config/config';
import { PlaceHolder } from './models/place-holder';

export class PlaceHolderDecorator {
  private config: Config;
  private cache: { [index: string]: Uri };
  private decorations: TextEditorDecorationType[] = [];

  public refreshConfig(config: Config) {
    this.config = config;

    this.updateCache();
  }

  public addDecorations(editor: TextEditor, placeholders: PlaceHolder[]) {
    const decorationType = window.createTextEditorDecorationType({
      after: {
        margin: `0 0 0 ${1 * -this.config.placeholder.width}px`,
        height: `${this.config.placeholder.height}px`,
        width: `${1 * this.config.placeholder.width}px`
      }
    });

    const options = map(
      placeholder => ({
        range: new Range(
          placeholder.line,
          placeholder.character + 1,
          placeholder.line,
          placeholder.character + 1
        ),
        renderOptions: {
          dark: {
            after: {
              contentIconPath: this.cache[placeholder.placeholder]
            }
          },
          light: {
            after: {
              contentIconPath: this.cache[placeholder.placeholder]
            }
          }
        }
      }),
      placeholders
    );

    this.decorations.push(decorationType);

    editor.setDecorations(decorationType, options);
  }

  public removeDecorations(editor: TextEditor) {
    forEach(item => {
      editor.setDecorations(item, []);
      item.dispose();
    }, this.decorations);
  }

  private updateCache() {
    this.cache = {};

    // TODO: use reduce
    forEach(
      code => (this.cache[code] = this.buildUri(code)),
      this.config.characters
    );
  }

  private buildUri(code: string) {
    const root = builder.create('svg', {}, {}, { headless: true });

    root
      .att('xmlns', 'http://www.w3.org/2000/svg')
      .att(
        'viewBox',
        `0 0 ${this.config.placeholder.width} ${this.config.placeholder.height}`
      )
      .att('width', this.config.placeholder.width)
      .att('height', this.config.placeholder.height);

    root
      .ele('rect')
      .att('width', this.config.placeholder.width)
      .att('height', this.config.placeholder.height)
      .att('rx', 2)
      .att('ry', 2)
      .att('style', `fill: ${this.config.placeholder.backgroundColor}`);

    root
      .ele('text')
      .att('font-weight', this.config.placeholder.fontWeight)
      .att('font-family', this.config.placeholder.fontFamily)
      .att('font-size', `${this.config.placeholder.fontSize}px`)
      .att('fill', this.config.placeholder.color)
      .att('x', this.config.placeholder.textPosX)
      .att('y', this.config.placeholder.textPosY)
      .text(
        this.config.placeholder.upperCase
          ? code.toUpperCase()
          : code.toLowerCase()
      );

    const svg = root.end({
      pretty: false
    });

    return Uri.parse(`data:image/svg+xml;utf8,${svg}`);
  }
}
