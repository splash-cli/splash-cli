import { hasKey } from '@src/utils/functional'
import { pipe } from 'fp-ts/function'

describe( 'Utils - Functional', () => {
  describe( 'hasKey', () => {
    it( 'Should call all the handlers', () => {
      const handler = jest.fn()

      const data = {
        key1: 'string',
        key2: true,
        key3: 1
      }

      pipe(
        data,
        hasKey( 'key1', handler ),
        hasKey( 'key2', handler ),
        hasKey( 'key3', handler ),
      )

      expect( handler )
        .toHaveBeenCalledWith( data.key1 )

      expect( handler )
        .toHaveBeenCalledWith( data.key2 )

      expect( handler )
        .toHaveBeenCalledWith( data.key3 )
    } )
  } )
} )
