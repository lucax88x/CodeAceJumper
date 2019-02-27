export class Input {
  public text: string;
  public resolve: (text: string) => void;
  public reject: (reason: string) => void;
  constructor(options: {
    resolve: (text: string) => void;
    reject: (reason: string) => void;
  }) {
    this.text = '';
    this.resolve = options.resolve;
    this.reject = options.reject;
  }
}
