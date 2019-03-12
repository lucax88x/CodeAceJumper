export class Placeholder {
  public index = 0;
  public placeholder: string;
  public line: number;
  public character: number;
  public root?: Placeholder;
  public childrens: Placeholder[] = [];
}
