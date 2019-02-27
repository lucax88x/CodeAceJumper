import { TextEditor } from 'vscode';

import { PlaceHolder } from './place-holder';

export interface JumpResult {
  editor: TextEditor;
  placeholder: PlaceHolder;
}
