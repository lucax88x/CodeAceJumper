import { CancelReason } from './cancel-reason';

export class Input {
  public text: string;
  public resolve: (text: string) => void;
  public reject: (canceled: CancelReason) => void;
  constructor(options: {
    resolve: (text: string) => void;
    reject: (canceled: CancelReason) => void;
  }) {
    this.text = '';
    this.resolve = options.resolve;
    this.reject = options.reject;
  }
}
