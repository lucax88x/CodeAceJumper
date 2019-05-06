import { forEach } from 'ramda';
import { TextEditor } from 'vscode';

import { Config } from './config/config';
import { JumpArea } from './models/jump-area';

export class JumpAreaFinder {
  private config: Config;

  public refreshConfig(config: Config) {
    this.config = config;
  }

  /**
   * Returns the area where we are gonna search the text
   */
  public findArea(editor: TextEditor): JumpArea {
    const jumpSelection = new JumpArea();

    if (!this.config.finder.skipSelection && !editor.selection.isEmpty) {
      if (editor.selection.anchor.line > editor.selection.active.line) {
        jumpSelection.push(
          editor.selection.active.line,
          editor.selection.anchor.line
        );
      } else {
        jumpSelection.push(
          editor.selection.anchor.line,
          editor.selection.active.line
        );
      }
    } else {
      if (editor.visibleRanges.length === 0) {
        throw Error('There are no visible ranges!');
      }

      forEach(
        visibleRange =>
          visibleRange &&
          jumpSelection.push(visibleRange.start.line, visibleRange.end.line),
        editor.visibleRanges
      );
    }

    return jumpSelection;
  }
}
