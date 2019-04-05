import { forEach, map, reduce } from 'ramda';
import {
  DecorationOptions,
  DecorationRenderOptions,
  Position,
  Range,
  TextEditor,
  TextEditorDecorationType,
  Uri,
  window
} from 'vscode';
import * as builder from 'xmlbuilder';

import { Config } from './config/config';
import { Placeholder } from './models/placeholder';

export class PlaceHolderDecorator {
  private config: Config;
  private placeholderCache: { [index: string]: Uri };
  private dim: TextEditorDecorationType;
  private decorations: TextEditorDecorationType[] = [];
  private highlight: TextEditorDecorationType;

  public refreshConfig(config: Config) {
    this.config = config;

    this.updateCache();
  }

  public addDecorations(editor: TextEditor, placeholders: Placeholder[]) {
    const width = this.config.placeholder.width;
    const height = this.config.placeholder.height;

    const decorationType = window.createTextEditorDecorationType({
      after: {
        margin: `0 0 0 ${1 * -width}px`,
        height: `${height}px`,
        width: `${1 * width}px`
      }
    });

    const options = map<Placeholder, DecorationOptions>(
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
              contentIconPath: this.placeholderCache[placeholder.placeholder]
            }
          },
          light: {
            after: {
              contentIconPath: this.placeholderCache[placeholder.placeholder]
            }
          }
        }
      }),
      placeholders
    );

    this.decorations.push(decorationType);

    editor.setDecorations(decorationType, options);
  }

  public addHighlights(
    editor: TextEditor,
    placeholders: Placeholder[],
    highlightCount: number
  ) {
    const type: DecorationRenderOptions = {
      textDecoration: `none; background-color: ${
        this.config.highlight.backgroundColor
      }`
    };

    const options = map<Placeholder, DecorationOptions>(
      placeholder => ({
        range: new Range(
          placeholder.line,
          placeholder.character + 1,
          placeholder.line,
          placeholder.character + 1 + highlightCount
        )
      }),
      placeholders
    );

    this.highlight = window.createTextEditorDecorationType(type);

    editor.setDecorations(this.highlight, options);
  }

  public dimEditor(editor: TextEditor, ranges: Range[]) {
    this.undimEditor(editor);

    const options: DecorationRenderOptions = {
      textDecoration: `none; filter: grayscale(1);`
    };

    this.dim = window.createTextEditorDecorationType(options);

    const toAddRanges = [];
    if (!!ranges && !!ranges.length) {
      toAddRanges.push(...ranges);
    } else {
      toAddRanges.push(
        new Range(
          new Position(0, 0),
          new Position(editor.document.lineCount, Number.MAX_VALUE)
        )
      );
    }

    editor.setDecorations(this.dim, toAddRanges);
  }

  public removeDecorations(editor: TextEditor) {
    forEach(item => {
      editor.setDecorations(item, []);
      item.dispose();
    }, this.decorations);

    this.decorations = [];
  }

  public removeHighlights(editor: TextEditor) {
    if (!!this.highlight) {
      editor.setDecorations(this.highlight, []);
      this.highlight.dispose();
      delete this.highlight;
    }
  }

  public undimEditor(editor: TextEditor) {
    if (!!this.dim) {
      editor.setDecorations(this.dim, []);
      this.dim.dispose();
      delete this.dim;
    }
  }

  private updateCache() {
    this.placeholderCache = reduce<string, { [index: string]: Uri }>(
      (acc, code) => {
        acc[code] = this.buildUriForPlaceholder(code);
        return acc;
      },
      {}
    )(this.config.characters);
  }

  private buildUriForPlaceholder(code: string) {
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
