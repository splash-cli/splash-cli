import { pathFixer, isPath } from '@src/utils/strings';
import os from 'os'

describe('Utils - Strings', () => {
  describe('PathFixer', () => {
    it('Should replace tilde with home', () => {
      const result = pathFixer('~/Pictures')
      const expected = `${os.homedir()}/Pictures`

      expect(result)
        .toEqual(expected)
    })
  })

  describe('isPath', () => {
    it('Should check if the given string is a path', () => {
      const path = '/usr/local/bin'
      const result = isPath(path)
      const expected = true;

      expect(result)
        .toEqual(expected)
    })
  })
})
