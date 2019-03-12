export class Input {
  public text: string;
  public resolve: (text: string) => void;
  public reject: (canceled: boolean) => void;
  constructor(options: {
    resolve: (text: string) => void;
    reject: (canceled: boolean) => void;
  }) {
    this.text = '';
    this.resolve = options.resolve;
    this.reject = options.reject;
  }
}
