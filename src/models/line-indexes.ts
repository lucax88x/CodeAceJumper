export class LineIndexes {
  // count of indexes occurences
  public count = 0;
  // indexes for each line
  // -1 index it's used when we restrict, and means that is a placeholder that didnt meet the restrict requirements
  public indexes: { [key: string]: number[] } = {};
  // highlight count, will start by zero and each multi-char iteration will increase
  public highlightCount = 0;
}
