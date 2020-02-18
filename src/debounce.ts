export function debounce<T extends Function>(func: T, waitFor = 20) {
  let timeout: any = 0;
  let callable = (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return <T>(<any>callable);
}

type PromiseFunction<D> = (...args: any[]) => Promise<D>;

export const asyncDebounce = <F extends PromiseFunction<D>, D>(func: F, waitFor: number) => {
    let timeout: any = 0;
  
    return (...args: Parameters<F>): Promise<D> =>
      new Promise<D>(resolve => {
        if (timeout) {
          clearTimeout(timeout)
        }
  
        timeout = setTimeout(async() => resolve(await func(...args)), waitFor)
      })
  }
