export type Func<T, U> = (arg: T) => U

export const hasKey = <T extends object, K extends keyof T = keyof T>(key: K, fn: Func<T[K], void>) => (item: T): T => {
  const val: T[K] = item[key];

  if ( !val ) {
    return item;
  }

  fn(val)

  return item
}

export const MissingImplementation = () => {
  throw new SyntaxError('Missing Implementation.')
}
