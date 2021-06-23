import * as E from 'fp-ts/Either'

/**
 * @description Try to parse JSON without throwing error.
 */
export const tryParse = <T extends object>(string: string): E.Either<string, T> => {
  try {
    const data : T = JSON.parse(string)

    return E.right(data)
  } catch (error) {
    return E.left(string);
  }
}

export const mapObject = <T, U>(obj: T, mapper: (arg: T) => U): U => mapper(obj)
