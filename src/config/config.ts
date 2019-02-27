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
  public placeholder = new PlaceHolderConfig();
  public finder = new FinderConfig();
}

export function buildConfig(cfg: WorkspaceConfiguration) {
  const config = new Config();

  config.placeholder = {
    backgroundColor: cfg.get('placeholder.backgroundColor', 'yellow'),
    color: cfg.get('placeholder.color', 'black'),
    border: cfg.get('placeholder.border', 'dotted thin black'),

    width: cfg.get('placeholder.width', 12),
    height: cfg.get('placeholder.height', 14),

    textPosX: cfg.get('placeholder.textPosX', 2),
    textPosY: cfg.get('placeholder.textPosY', 12),

    fontSize: cfg.get('placeholder.fontSize', 14),
    fontWeight: cfg.get('placeholder.fontWeight', 'normal'),
    fontFamily: cfg.get('placeholder.fontFamily', 'Consolas'),
    upperCase: cfg.get('placeholder.upperCase', false)
  };

  config.finder = {
    pattern: cfg.get('finder.pattern', `[ ,-.{_(\"'<\\[]`),
    skipSelection: cfg.get('finder.skipSelection', false),
    onlyInitialLetter: cfg.get('finder.onlyInitialLetter', true)
  };

  return config;
}
