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
  private lineEndDecorations: Record<number, [string, TextEditorDecorationType]> = {};
  private highlight: TextEditorDecorationType;

  public refreshConfig(config: Config) {
    this.config = config;
  }

  public addDecorations(editor: TextEditor, placeholders: Placeholder[], offset = 0) {
    for (const placeholder of placeholders) {
      let range = new Range(
        new Position(placeholder.line, placeholder.character + offset),
        new Position(placeholder.line, placeholder.character + offset + 1),
      );
      const lineLength = editor.document.lineAt(placeholder.line).range.end.character;
      let placeholderChar = placeholder.placeholder;

      if (range.start.character >= lineLength) {
        // always start range on line-end (as line-end + 1 would fail)
        range = new Range(
          new Position(placeholder.line, lineLength),
          new Position(placeholder.line, lineLength + 1),
        );
        // if a placeholder already exists at line-end, concat the placeholder chars
        if (!!this.lineEndDecorations[placeholder.line]) {
          placeholderChar += this.lineEndDecorations[placeholder.line][0];
          this.lineEndDecorations[placeholder.line][1].dispose();
        }
      }

      const decorationType = window.createTextEditorDecorationType({
        letterSpacing: '-16px',
        opacity: '0',
        before: {
          contentText: this.config.placeholder.upperCase
            ? placeholderChar.toUpperCase()
            : placeholderChar,
          backgroundColor: this.config.placeholder.backgroundColor,
          color: this.config.placeholder.color,
          border: this.config.placeholder.border,
          fontWeight: this.config.placeholder.fontWeight,
        },
      });
      editor.setDecorations(decorationType, [range]);
      this.decorations.push(decorationType);
      if (range.start.character == lineLength) {
        // remember placeholders at line-end for each line
        this.lineEndDecorations[placeholder.line] = [placeholderChar, decorationType];
      }

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
    this.lineEndDecorations = {};
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
