export class Config {
  characters: string[] = [
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
  placeholder: PlaceHolderConfig = new PlaceHolderConfig();
  finder: FinderConfig = new FinderConfig();
}

class PlaceHolderConfig {
  backgroundColor: string = 'yellow';

  color: string = 'black';
  border: string = 'dotted thin black';

  width: number = 12;
  height: number = 14;

  textPosX: number = 2;
  textPosY: number = 12;

  fontSize: number = 14;
  fontWeight: string = 'normal';
  fontFamily: string = 'Consolas';

  upperCase: boolean = false;
}

class FinderConfig {
  pattern: string;
  skipSelection: boolean = false;
  onlyInitialLetter: boolean = true;
}
