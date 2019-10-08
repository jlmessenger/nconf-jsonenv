const nconf = require('nconf');

class Jsonenv extends nconf.Memory {
	constructor(options = {}) {
		super(options);
		this.type = 'jsonenv';
		this.valPrefix = options.prefix || 'JSONCONF_';
		this.pathSuffix = options.suffix || '_AT';
		this.readOnly = options.readOnly !== false;
	}
	loadJsonEnv() {
		const keys = Object.keys(process.env).filter(key => key.startsWith(this.valPrefix) && !key.endsWith(this.pathSuffix));
		keys.sort();

		let resetReadOnly = this.readOnly;
		this.readOnly = false;

		keys.forEach(key => {
			const val = JSON.parse(process.env[key]);
			const path = process.env[`${key}${this.pathSuffix}`];
			if (path) {
				this.merge(path, val);
			} else {
				Object.keys(val).forEach(subKey => this.merge(subKey, val[subKey]));
			}
		});

		this.readOnly = resetReadOnly;
	}
	loadSync() {
		this.loadJsonEnv();
		return this.store;
	}
}

module.exports = nconf.Jsonenv = Jsonenv;
