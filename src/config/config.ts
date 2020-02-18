import { WorkspaceConfiguration } from 'vscode';

import { DimConfig } from './dim-config';
import { FinderConfig } from './finder-config';
import { HighlightConfig } from './highlight-config';
import { PlaceholderConfig } from './placeholder-config';
import { ScrollConfig } from './scroll-config';

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
    'z',
  ];
  public placeholder = new PlaceholderConfig();
  public highlight = new HighlightConfig();
  public finder = new FinderConfig();
  public dim = new DimConfig();
  public scroll = new ScrollConfig();
}

export function buildConfig(cfg: WorkspaceConfiguration) {
  const config = new Config();

  config.placeholder = {
    backgroundColor: cfg.get('placeholder.backgroundColor', '#c0b18b'),
    color: cfg.get('placeholder.color', '#333'),
    upperCase: cfg.get('placeholder.upperCase', false),
    fontWeight: cfg.get('placeholder.fontWeight', '500'),
    border: cfg.get('placeholder.border', 'none'),
  };

  config.highlight = {
    backgroundColor: cfg.get(
      'highlight.backgroundColor',
      'rgba(124,240,10,0.5)',
    ),
  };

  config.finder = {
    pattern: cfg.get('finder.pattern', `[ ,-.{_(\"'<\\[\t]`),
    skipSelection: cfg.get('finder.skipSelection', false),
    onlyInitialLetter: cfg.get('finder.onlyInitialLetter', true),
  };

  config.dim = {
    enabled: cfg.get('dim.enabled', true),
  };

  config.scroll = {
    mode: cfg.get('scroll.mode', 'center'),
  };

  return config;
}
