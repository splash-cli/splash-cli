import ora, { Ora } from 'ora';
import { isMonth } from './date';

export const getSpinner = (): Ora['spinner'] => isMonth(12)
  ? 'christmas'
  : 'earth'

export const createSpinner = (text: string) =>
  ora({
    text,
    color: 'yellow',
    spinner: getSpinner()
  })
