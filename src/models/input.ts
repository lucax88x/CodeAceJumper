export class Input {
  public text: string;
  public validateInput: (text: string) => string;
  public resolve: (text: string) => void;
  public reject: (reason: string) => void;
  constructor(options: {
    validateInput: (text: string) => string;
    resolve: (text: string) => void;
    reject: (reason: string) => void;
  }) {
    this.text = '';
    this.validateInput = options.validateInput;
    this.resolve = options.resolve;
    this.reject = options.reject;
  }
}
