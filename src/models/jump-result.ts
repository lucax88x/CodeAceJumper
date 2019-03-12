import { TextEditor } from 'vscode';

import { Placeholder } from './placeholder';

export interface JumpResult {
  editor: TextEditor;
  placeholder: Placeholder;
}
