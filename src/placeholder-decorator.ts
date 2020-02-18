import { forEach, map } from 'ramda';
import {
  DecorationOptions,
  DecorationRenderOptions,
  Position,
  Range,
  TextEditor,
  TextEditorDecorationType,
  window,
} from 'vscode';
import { Config } from './config/config';
import { Placeholder } from './models/placeholder';

export class PlaceHolderDecorator {
  private config: Config;
  private dim: TextEditorDecorationType;
  private decorations: TextEditorDecorationType[] = [];
  private highlight: TextEditorDecorationType;

  public refreshConfig(config: Config) {
    this.config = config;
  }

  public addDecorations(editor: TextEditor, placeholders: Placeholder[], offset = 0) {
    for (const placeholder of placeholders) {
      const range = new Range(
        new Position(placeholder.line, placeholder.character + offset),
        new Position(placeholder.line, placeholder.character + offset + 1),
      );

      const decorationType = window.createTextEditorDecorationType({
        letterSpacing: '-16px',
        opacity: '0',
        before: {
          contentText: this.config.placeholder.upperCase
            ? placeholder.placeholder.toUpperCase()
            : placeholder.placeholder,
          backgroundColor: this.config.placeholder.backgroundColor,
          color: this.config.placeholder.color,
          border: this.config.placeholder.border,
          fontWeight: this.config.placeholder.fontWeight,
        },
      });
      editor.setDecorations(decorationType, [range]);
      this.decorations.push(decorationType);

      for (const children of placeholder.childrens) {
        this.addDecorations(editor, [children], offset + 1);
      }
    }
  }

  public addHighlights(
    editor: TextEditor,
    placeholders: Placeholder[],
    highlightCount: number,
  ) {
    const type: DecorationRenderOptions = {
      textDecoration: `none; background-color: ${this.config.highlight.backgroundColor}`,
    };

    const options = map<Placeholder, DecorationOptions>(
      placeholder => ({
        range: new Range(
          placeholder.line,
          placeholder.character + 1,
          placeholder.line,
          placeholder.character + 1 + highlightCount,
        ),
      }),
      placeholders,
    );

    this.highlight = window.createTextEditorDecorationType(type);

    editor.setDecorations(this.highlight, options);
  }

  public dimEditor(editor: TextEditor, ranges: Range[]) {
    this.undimEditor(editor);

    const options: DecorationRenderOptions = {
      textDecoration: `none; filter: grayscale(1);`,
    };

    this.dim = window.createTextEditorDecorationType(options);

    const toAddRanges = [];
    if (!!ranges && !!ranges.length) {
      toAddRanges.push(...ranges);
    } else {
      toAddRanges.push(
        new Range(
          new Position(0, 0),
          new Position(editor.document.lineCount, Number.MAX_VALUE),
        ),
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
}
