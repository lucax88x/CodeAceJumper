export class Config {
    characters: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    //characters: string[] = ["a", "b", "c"]
    placeholder: PlaceHolderConfig = new PlaceHolderConfig();
    finder: FinderConfig = new FinderConfig();
}

class PlaceHolderConfig {
    backgroundColor: string;
    color: string;
    border: string;
}

class FinderConfig {
    pattern: string;
}