import Axios from 'axios'
import { pipe } from 'fp-ts/lib/function';
import { Settings } from './storage';
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export namespace Auth {
  export type Scope = 'public'
    | 'read_user'
    | 'write_user'
    | 'read_photos'
    | 'write_photos'
    | 'write_likes'
    | 'write_followers'
    | 'read_collections'
    | 'write_collections';


  export type Params = {
    client_id: string;
    client_secret: string;
    code: string;
    redirect_uri: string;
  }
}

// This generates the url that the user will click to authenticate.
// It's kinda our "Login with Unsplash" button.
export const getAuthenticationUrl = (...scopes: Auth.Scope[]) : string => {
  const url = new URL('https://unsplash.com/oauth/authorize')

  const keys = Settings.get('KEYS')

  url.searchParams.set('client_id', keys.APP_ID)
  url.searchParams.set('redirect_uri', keys.REDIRECT_URI)
  url.searchParams.set('response_type', 'code')

  url.searchParams.set('scope', scopes.join('+'))

  return url.href
}

// Utility
export const isLogged = (): boolean =>
  Settings.get('KEYS').ACCESS_TOKEN !== null

export const logout = (): void =>
  Settings.set('KEYS.ACCESS_TOKEN', null)

export const saveToken = (token: string): void =>
  Settings.set('KEYS.ACCESS_TOKEN', token)


type LoginResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  created_at: number;
}

export const login = (
  client_id: string,
  client_secret: string,
  redirect_uri: string,
  code: string,
  grant_type: string
) =>
  pipe(
    TE.tryCatch(
      () => Axios.post<LoginResponse>('https://unsplash.com/oauth/token', {
        client_id,
        client_secret,
        redirect_uri,
        code,
        grant_type
      }),
      E.toError
    ),
    TE.map(response => saveToken(response.data.access_token)),
  )
