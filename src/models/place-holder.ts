export class PlaceHolder {
  public index: number;
  public placeholder: string;
  public line: number;
  public character: number;
  public root?: PlaceHolder;
  public childrens: PlaceHolder[] = [];
}
