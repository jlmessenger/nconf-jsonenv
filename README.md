# nconf-jsonenv

Configure [nconf](https://www.npmjs.com/package/nconf) with JSON from environment variables.

By default it looks for environment variables with prefix `JSONCONF_`, parses them as JSON and
merges them into the nconf config. Environment variables are processed alphabetically, so you
can control their order using simple A-Z naming conventions `JSONCONF_A`, `JSONCONF_B`, etc.

By default all configs are merged into the top-level config, but this can be overridden by
adding a second environment variable with the same name, and suffix `_AT` with the nconf
path where the config should be added.

For example, suppose the following environment variables are defined.
```bash
export JSONCONF_A='{"port": 3000}'
export JSONCONF_B='{"hostname": "127.0.0.1", "password": "shhh"}'
export JSONCONF_B_AT='db:main'
```

They would produce the following nconf configuration.
```js
{
	port: 3000,
	db: {
		main: {
			hostname: '127.0.0.1',
			password: 'shhh'
		}
	}
}
```

### Installation
```bash
npm install --save nconf nconf-jsonenv
```

### Usage
```js
const nconf = require('nconf');
require('nconf-jsonenv');

nconf.use('jsonenv');
```

### Options
 * `prefix` - string prefix to match for environment variables, default `"JSONCONF_"`
 * `suffix` - string to indicate merge path override, default `"_AT"`
 * `readOnly` - boolean if values can be overridden, default `false`.

Example passing custom options:
```js
nconf.use('jsonenv', {
	prefix: 'CUSTOM',
	suffix: 'X',
	readOnly: false
});
```
