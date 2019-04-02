import { WorkspaceConfiguration } from 'vscode';

import { DimConfig } from './dim-config';
import { FinderConfig } from './finder-config';
import { HighlightConfig } from './highlight-config';
import { PlaceholderConfig } from './placeholder-config';

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
  public placeholder = new PlaceholderConfig();
  public highlight = new HighlightConfig();
  public finder = new FinderConfig();
  public dim = new DimConfig();
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

  config.highlight = {
    backgroundColor: cfg.get(
      'highlight.backgroundColor',
      'rgba(124,240,10,0.5)'
    ),

    width: cfg.get('highlight.width', 10),
    height: cfg.get('highlight.height', 14),
    offsetX: cfg.get('highlight.offsetX', 0),
    offsetY: cfg.get('highlight.offsetY', 0)
  };

  config.finder = {
    pattern: cfg.get('finder.pattern', `[ ,-.{_(\"'<\\[]`),
    skipSelection: cfg.get('finder.skipSelection', false),
    onlyInitialLetter: cfg.get('finder.onlyInitialLetter', true)
  };

  config.dim = {
    enabled: cfg.get('dim.enabled', true)
  };

  return config;
}
