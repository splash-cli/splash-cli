import { Ora } from 'ora';

export const Quiet = (Spinner: Ora) => (isQuiet: boolean) => {
  if (!isQuiet) return;

  const emptyFunction = () : any => null;

  console.log = console.info = emptyFunction;

  if (Spinner.fail) {
    Spinner.fail = emptyFunction;
  }

  if (Spinner.start) {
    Spinner.start = emptyFunction;
  }

  if (Spinner.succeed) {
    Spinner.succeed = emptyFunction;
  }
}
