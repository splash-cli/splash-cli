import fs from 'fs'
import path from 'path'
import { createApi } from 'unsplash-js'
import { Preferences, Settings } from './storage'
import { pipe } from 'fp-ts/lib/function'
import Axios from 'axios'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { Random } from 'unsplash-js/dist/methods/photos/types'
import sample from 'lodash.sample'
import isImage from 'is-image'
import downloadFile from 'simple-download'
import sharp from 'sharp'
import chalk from 'chalk'

import { Flags } from '@src/bin'
import { Quiet } from '@src/flags'

import { isPath, pathFixer } from './strings'
import { createSpinner } from './spinner'
import wallpaper from 'wallpaper'
import { isLogged } from './auth'
import { Logger } from './log'

export const Unsplash = createApi({
  accessKey: Settings.get('KEYS.APP_ID')
})

type PicOfTheDayResponse = {
  id: string;
}

export const getPicOfTheDay = () =>
 pipe(
    TE.tryCatch(
      () => Axios.get<PicOfTheDayResponse>('https://lambda.splash-cli.app/api'),
      E.toError
    ),
    TE.map(r => r.data.id),
    TE.chain(photoId => TE.tryCatch(
      () => Unsplash.photos.get({ photoId }),
      E.toError
    ))
  )

export const getPhoto = (photoId : string) =>
  TE.tryCatch(
    () => Unsplash.photos.get({ photoId }),
    E.toError
  )


export const getRandomPhoto = (filters: Parameters<typeof Unsplash.photos.getRandom>[0]) =>
  TE.tryCatch(
    () => Unsplash.photos.getRandom(filters),
    E.toError
  )

export const trackDownload = ({ download_location }: { download_location: string }) =>
  TE.tryCatch(
    () => Unsplash.photos.trackDownload({ downloadLocation: download_location }),
    E.toError
  )

export const dowloadPhoto = async (photo: Random, flags: Flags, setAsWp: boolean = false) => {
  let directory = Preferences.get('DOWNLOADS_FOLDER', pathFixer(`~/Pictures/splash_photos`))

  if ( Preferences.get('USE_USER_FOLDER', false) ) {
    directory = path.join(directory, `@${photo.user.username}`)
  }

  // Create dir if not exists
  fs.mkdirSync(directory, { recursive: true })

  const hasEdits: boolean = !!(flags.flip
    || flags.grayscale
    || flags.rotate
    || flags.colorspace)

  const sentences: string[] = [
    'Making something awesome',
    'Something is happening...',
    'Magic stuff',
    'Doing something... else',
    'You know, backend stuff...',
    'Preparing your photo...',
    'You\'re awesome!',
  ]

  if ( hasEdits ) {
    sentences.push('Applying your edits...')
  }


  const sentence = sample(sentences) || sentences[0]
  const Spinner = createSpinner(sentence)

  if ( flags.quiet ) {
    Quiet(Spinner)
  }

  Spinner.start()

  const filename = `${photo.id}.jpg`
  let filepath = path.join(directory, filename)

  // If a save path is specified.
  if ( flags.save && isPath(flags.save) ) {
    const pth = pathFixer(flags.save)
    filepath = path.join(pth, filename)

    if ( isImage(flags.save) ) {
      filepath = pth
    }
  }

  await pipe(
    photo.links,
    trackDownload,
    TE.chain(({ response }) => TE.tryCatch(
      () => downloadFile(response!.url, filepath),
      E.toError
    ))
  )()

  // Update Counter
  Settings
    .set(
      'COUNTER',
      Settings.get('COUNTER') + 1
    )

  if ( hasEdits ) {
    pipe(
      applyEdits(filepath, flags),
      E.map(image => {
        filepath = filepath.replace(/(\.[a-z+])$/g, '_edited$1')
        image.toFile(filepath)
      }),
      E.mapLeft(errors => Logger.warn(...errors))
    )
  }

  wallpaper.set(filepath, {
    scale: flags.scale,
    screen: flags.screen
  })

  console.log()
  console.log(photo, flags.info)
  console.log()

  if ( flags.rotate ) {
    // log rotation angle
  }

  if ( !isLogged() ) {
    Logger.info(chalk`{dim Login to like this photo.}`)
    console.log();
  } else if ( (photo as any)?.liked_by_user ) {
    Logger.info(chalk`{dim Photo liked by user.}`)
    console.log();
  }

  if ( flags.save  || !isLogged() ) return;
}

const isValidColorSpace = (colorspace: string): boolean => /srgb|rgb|cmyk|lab|b\-w/g.test(colorspace)

const applyEdits = (file: string, edits: Flags): E.Either<string[], sharp.Sharp> => {
  const errors : string[] = []

  let image = sharp(file)
    .grayscale(edits.grayscale)
    .flip(edits.flip)
    .rotate(edits.rotate || 0)

  if ( edits.colorspace ) {
    if ( !isValidColorSpace(edits.colorspace) ) {
      errors.push(`Invalid colorspace: ${edits.colorspace}`)
      return E.left(errors);
    }

    image = image
      .toColorspace(edits.colorspace)
  }

  if ( edits.blur ) {
    image = image
      .blur(edits.blur)
  }

  return E.right(image);
}
