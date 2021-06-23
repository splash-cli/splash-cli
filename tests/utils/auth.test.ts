import { getAuthenticationUrl } from '@src/utils/auth'

describe('Utils - Auth', () => {
  describe('getAuthenticationUrl', () => {
    it('Should generate a correct url', () => {
      const url = getAuthenticationUrl('public', 'read_user', 'read_collections')

      const params = new URLSearchParams(url)

      expect( params.has('scope') )
        .toBeTruthy()

      expect( params.get('scope') )
        .toBe('public+read_user+read_collections')

      expect( params.has('response_type') )
        .toBeTruthy()

      expect( params.get('response_type') )
        .toBe('code')
    })
  })
})
