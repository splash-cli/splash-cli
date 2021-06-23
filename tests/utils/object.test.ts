import { tryParse } from '@src/utils/object';

describe('Utils - Object', () => {
  describe('tryParse', () => {
    it('Should parse json', () => {
      const json = '{ "name": "John", "age": 30 }'
      const obj = tryParse(json)

      expect(obj._tag)
        .toEqual('Right')
    })

    it('Should parse json', () => {
      const json = '{ name: "John", age: 34 }'
      const obj = tryParse(json)

      expect(obj._tag)
        .toEqual('Left')
    })
  })
})
