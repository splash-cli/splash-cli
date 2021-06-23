import Meow, { BooleanFlag, Flag, NumberFlag, StringFlag, AnyFlag } from 'meow'
import { Orientation } from 'unsplash-js'
import wallpaper from 'wallpaper'

import Client from '../client'
import { helpText } from './help'

type ScreenFlag = Flag<'number', wallpaper.SetOptions['screen']>
type ScaleFlag = Flag<'number', wallpaper.SetOptions['scale']>
type OrientationFlag = Flag<'number', Orientation>

type AnyFlags = {
  [key: string]: AnyFlag | ScaleFlag | ScreenFlag | OrientationFlag
}

type GetFlags<T extends AnyFlags, K extends keyof T = keyof T> = {
  [k in K]: NonNullable<T[k]['default']>
}


type RawFlags = {
  help: BooleanFlag
  version: BooleanFlag
  id: StringFlag
  screen: Flag<'number', wallpaper.SetOptions['screen']>
  scale: Flag<'string', wallpaper.SetOptions['scale']>
  info: BooleanFlag
  save: StringFlag
  orientation: Flag<'string', Orientation>
  query: StringFlag
  settings: BooleanFlag
  user: StringFlag
  grayscale: BooleanFlag
  collection: StringFlag
  set: StringFlag
  day: BooleanFlag
  featured: BooleanFlag
  quiet: BooleanFlag
  rotate: NumberFlag
  colorspace: StringFlag
  flip: BooleanFlag
  blur: NumberFlag
}

export type Flags = GetFlags<RawFlags>

const { input, flags } = Meow(helpText, {
  importMeta: import.meta,
  autoHelp: true,
  autoVersion: true,
  flags: {
    help: {
      type: 'boolean',
      alias: 'h'
    },
    version: {
      type: 'boolean',
      alias: 'v'
    },
    set: {
      type: 'string'
    },
    collection: {
      type: 'string'
    },
    day: {
      type: 'boolean'
    },
    featured: {
      type: 'boolean',
      alias: 'f'
    },
    blur: {
      type: 'number'
    },
    quiet: {
      type: 'boolean',
      alias: 'q'
    },
    rotate: {
      type: 'number'
    },
    colorspace: {
      type: 'string'
    },
    flip: {
      type: 'boolean'
    },
    grayscale: {
      type: 'boolean',
    },
    user: {
      type: 'string',
      alias: 'u'
    },
    settings: {
      type: 'boolean'
    },
    id: {
      type: 'string'
    },
    query: {
      type: 'string'
    },
    orientation: {
      type: 'string',
      alias: 'o'
    },
    save: {
      type: 'string',
      alias: 's'
    },
    info: {
      type: 'boolean',
      alias: 'i'
    },
    scale: {
      type: 'string'
    },
    screen: {
      type: 'number'
    }
  }
})

Client(input, flags as Flags)
