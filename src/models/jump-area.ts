/**
 * Container of the lines where we are gonna perform our search
 */
export class JumpArea {
  constructor(public lines: Array<[number, number]> = []) {}

  public push(startLine: number, endLine: number) {
    this.lines.push([startLine, endLine]);
  }
}
