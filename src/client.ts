
import os from 'os'
import dns from 'dns'
import ms from 'ms'
import Ora from 'ora'
import chalk from 'chalk'
import wallpaper from 'wallpaper';
import updateNotifier from 'update-notifier'
import isFirstRun from 'first-run'
import { match } from 'ts-pattern'
import * as E from 'fp-ts/Either'

import * as FlagsUtils from './flags'

import { isMonth } from './utils/date';
import { Flags } from './bin'
import { Settings } from './utils/storage';

import manifest from '../package.json'
import { pipe } from 'fp-ts/lib/function';
import { hasKey, MissingImplementation } from './utils/functional';

import { Logger } from '@src/utils/log'
import { getPhoto, getPicOfTheDay, getRandomPhoto, Unsplash } from './utils/api';
import { Random } from 'unsplash-js/dist/methods/photos/types';

const client = async ([ command, ...subCommands ]: string[], flags: Flags) : Promise<void> => {
  const Spinner = Ora({
    color: 'yellow',
    spinner: isMonth(12)
      ? 'christmas'
      : 'earth'
  })

  // check if the client is connected to the web
  dns.lookup('api.unsplash.com', err => {
    if ( err && err.code === 'ENOTFOUND' ) {
			console.error(chalk.red('\n Please check your internet connection.\n'));
      process.exit(1)
    }
  })


  const options : Record<string, string> = {};
  for ( const cmd of subCommands ) {
    options[cmd] = cmd;
  }

  // Update last wallpaper
  if ( !Settings.has('LAST_WALLPAPER') || !Settings.get('LAST_WALLPAPER') ) {
    const LAST_WALLPAPER = await wallpaper.get();
    Settings.set('LAST_WALLPAPER', LAST_WALLPAPER)
  }

  if ( !flags.quiet ) {
    // Check for updates on NPM
    const notifier = updateNotifier({
      updateCheckInterval: ms('30m'),
      pkg: manifest
    })

    notifier.notify()
  }

  if ( isFirstRun() ) {
    Logger.printBlock(
			chalk`Welcome to ${manifest.name}@{dim ${manifest.version}} {bold @${os.userInfo().username}}`,
			'',
			chalk`{dim CLI setup {green completed}!}`,
			'',
			chalk`{bold Enjoy "{yellow ${manifest.name}}" running {green splash}}`,
		);
  }

  pipe(
    flags,
    hasKey('quiet', FlagsUtils.Quiet(Spinner))
  )

  if ( command ) {
    MissingImplementation()
    return
  };

  // No commands, standard procedure.
  const photoResponse = await match(flags)
    .when(f => f.day, getPicOfTheDay)
    .when(f => f.id, ({ id }) => getPhoto(id))
    .otherwise(() => getRandomPhoto({
      collectionIds: flags.collection.split(','),
      username: flags.user,
      query: flags.query,
      orientation: flags.orientation,
      featured: flags.featured,
      count: 1
    }))()

  // Handle the error
  if ( E.isLeft(photoResponse) ) {
    MissingImplementation()
    return
  }

  const { response, type: resType, errors } = photoResponse.right

  // Something went wrong.
  if ( !response || resType !== 'success' ) {
    Spinner.fail('Unable to connect.')
    return
  }

  if ( errors ) {
    // ReImplement Sentry.
    return Logger
      .printBlock(chalk`{bold {red ERROR:}}`, ...errors)
  }

  const photo : Random = Array.isArray(response)
    ? response[0]
    : response


}

export default client;
