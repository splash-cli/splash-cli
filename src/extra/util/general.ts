import config from '../storage'
import Ora from 'ora'
import { printBlock, logger } from './printing'
import chalk from 'chalk'
import terminalLink from 'terminal-link'
import { reportPrompt } from '@extra/utils'


/**
 * @description Beautify any type of error
 * @param {Error} error
 */
export const errorHandler = async ( error: any ): Promise<void> => {
	config.set( 'lastError', error );

	const spinner = new Ora();
	spinner.stop();
	printBlock(
		'',
		chalk`{bold {red OOps! We got an error!}}`,
		'',
		chalk`Please report it: {underline {green ${terminalLink(
			'on GitHub',
			'https://github.com/splash-cli/splash-cli/issues',
		)}}}`,
		'',
		chalk`{yellow {bold Splash Error}:}`,
		'',
	);

	if ( config.get( 'shouldReportErrors' ) === true || config.get( 'shouldReportErrorsAutomatically' ) ) {
		await reportPrompt( error );
	}

	// Log the error
	logger.error( error );
}
