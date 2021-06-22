import isMonth from '@splash-cli/is-month';
import chalk from 'chalk';

import pkg from '../../package.json';

export default chalk`{bold Usage} [{dim v${pkg.version}}]
	${isMonth('december') ? chalk`{yellow Merry Christmas!}\n` : ''}
	$ {green splash} {dim [command] [flags]}

{bold {cyan Commands}}
	{cyan settings {dim <get|set|restore>}}	{dim GET/SET/RESTORE SETTINGS}
	{cyan alias {dim <get|set|remove>}}		{dim GET/SET COLLECTION ALIASES}
	{cyan collection {dim <get|delete>}}		{dim MANAGE COLLECTIONS}
	{cyan dir {dim <clean|get|count>}}		{dim MANAGE THE DOWNLOAD DIRECTORY}
	{cyan user {dim <login|logout|get|...>}} 	{dim MANAGE USER LOGIN/LOGOUT - GET USER INFOS}
	{dim -------------------------------------------------------------------------}
	{dim HINT: {bold use {cyan \`[command] help\`} for the list of all options}}

{bold {yellow Options}}
	{yellow -h --help}			{dim THIS MESSAGE}
	{yellow -v --version}			{dim v${pkg.version}}

	${
	process.platform === 'darwin'
		? chalk`{yellow --scale {dim <auto|fill|fit|stretch|center>}}  {dim SET WALLPAPER SCALE}\n\t{yellow --screen {dim <all|main|monitor number>}}	{dim SET AS WALLPAPER ON SELECTED MONITOR}`
		: ''
}

	{yellow -s --save {dim [optional_path]}} 	{dim DOWNLOAD WITHOUT SETTING AS WALLPAPER}
	{yellow --set {dim <path>}} 			{dim SET GIVEN PHOTO AS WALLPAPER}

	{yellow -i --info}			{dim SHOW EXIF}
	{yellow -q --quiet}			{dim NO OUTPUT}

{bold {cyan Image Manipulation}}
	{cyan --rotate {dim <degrees>}} 		{dim ROTATE THE IMAGE BY GIVEN DEGREES}
	{cyan --grayscale} 			{dim MAKES THE IMAGE BW}
	{cyan --flip} 				{dim FLIP THE PHOTO ON THE "Y" AXIS}
	{cyan --colorspace {dim <srgb|rgb|cmyk|lab|b-w>}} {dim CHANGE IMAGE "COLORSPACE"}

{bold {red Source Filters}}
	{red -c --curated}			{dim RANDOM CURATED PHOTO}
	{red -u --user {dim <username>}}		{dim RANDOM PHOTO FROM PROVIDED USER}

	{red --day}				{dim GET THE PHOTO OF THE DAY}
	{red --id {dim <id or url>}}		{dim PHOTO BY ID}
	{red --collection {dim <id or alias>}}	{dim RANDOM PHOTO FROM PROVIDED COLLECTION}


{bold {magenta Search Filters}}
	{magenta -f --featured}			{dim LIMIT TO ONLY FEATURED PHOTOS}
	{magenta --query {dim <query>}}			{dim RANDOM FROM QUERY}
	{magenta --orientation {dim <landscape|portrait|squarish>}} {dim SET WALLPAPER ORIENTATION (DEFAULT: 'landscape')}
`;
