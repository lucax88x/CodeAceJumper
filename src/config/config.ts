import { WorkspaceConfiguration } from 'vscode';

import { FinderConfig } from './finder-config';
import { PlaceHolderConfig } from './place-holder-config';

export class Config {
  public characters = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ];
  public placeholder: PlaceHolderConfig;
  public finder: FinderConfig;
}

export function buildConfig(config: WorkspaceConfiguration) {
  const cfg = new Config();
  cfg.placeholder.backgroundColor = config.get(
    'placeholder.backgroundColor',
    'yellow'
  );
  cfg.placeholder.color = config.get('placeholder.color', 'black');
  cfg.placeholder.border = config.get(
    'placeholder.border',
    'dotted thin black'
  );

  cfg.placeholder.width = config.get('placeholder.width', 12);
  cfg.placeholder.height = config.get('placeholder.height', 14);

  cfg.placeholder.textPosX = config.get('placeholder.textPosX', 2);
  cfg.placeholder.textPosY = config.get('placeholder.textPosY', 12);

  cfg.placeholder.fontSize = config.get('placeholder.fontSize', 14);
  cfg.placeholder.fontWeight = config.get('placeholder.fontWeight', 'normal');
  cfg.placeholder.fontFamily = config.get('placeholder.fontFamily', 'Consolas');
  cfg.placeholder.upperCase = config.get('placeholder.upperCase', false);

  cfg.finder.pattern = config.get('finder.pattern', `[ ,-.{_(\"'<\\[]`);
  cfg.finder.skipSelection = config.get('finder.skipSelection', false);
  cfg.finder.onlyInitialLetter = config.get('finder.onlyInitialLetter', true);

  return cfg;
}
