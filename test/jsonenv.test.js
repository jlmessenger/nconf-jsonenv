const assert = require('assert');

const nconf = require('nconf');
const Jsonenv = require('../lib/Jsonenv');

describe('Jsonenv Class', () => {
	const origEnv = process.env;
	after(() => {
		process.env = origEnv;
	});
	it('merges to root by default', () => {
		const instance = new Jsonenv({ readOnly: false });
		instance.set('overwritten', 'value1');
		instance.set('unaffected', 'value1');
		instance.set('deeply:nested', { object: 'value1' });
		process.env = {
			'JSONCONF_0': '{"new": "value2", "overwritten": "value2", "deeply": {"nested": {"new": "value2"}}}'
		};
		const store = instance.loadSync();
		assert.deepStrictEqual(store, {
			overwritten: 'value2',
			unaffected: 'value1',
			deeply: {
				nested: {
					object: 'value1',
					new: 'value2'
				}
			},
			new: 'value2'
		});
	});
	it('can specify merge path', () => {
		const instance = new Jsonenv({ readOnly: false });
		instance.set('unaffected', 'value1');
		instance.set('deeply:nested', { unaffected: 'value1', overwritten: 'value1' });
		process.env = {
			'JSONCONF_0': '{"overwritten": "value2", "new": "value2"}',
			'JSONCONF_0_AT': 'deeply:nested'
		};
		const store = instance.loadSync();
		assert.deepStrictEqual(store, {
			unaffected: 'value1',
			deeply: {
				nested: {
					unaffected: 'value1',
					overwritten: 'value2',
					new: 'value2'
				}
			}
		});
	});
	it('merges trees alphabetically', () => {
		const instance = new Jsonenv();
		process.env = {
			'JSONCONF_ZZ': '{"value": "last"}',
			'JSONCONF_0': '{"value": "initial", "zero": 0, "deeper": {"other": true, "key": 2}}',
			'JSONCONF_A': '{"value": "mid", "a": "a"}',
			'JSONCONF_1': '3',
			'JSONCONF_1_AT': 'deeper:key',
		};
		const store = instance.loadSync();
		assert.deepStrictEqual(store, {
			value: 'last',
			zero: 0,
			a: 'a',
			deeper: {
				other: true,
				key: 3
			}
		});
	});
	it('can change prefix and suffix', () => {
		const instance = new Jsonenv({
			prefix: 'MOO',
			suffix: 'COW'
		});
		process.env = {
			'JSONCONF_0': '{"value": "ignored not a cow"}',
			'MOO': '{"cow": "is mooing"}',
			'MOOCOW': 'farm:field'
		};
		const store = instance.loadSync();
		assert.deepStrictEqual(store, {
			farm: {
				field: {
					cow: 'is mooing'
				}
			}
		});
	});
});
describe('nconf.use(\'jsonenv\')', () => {
	it('load into nconf', () => {
		process.env = {
			'JSONCONF_0': '{"first": "from Jsonenv", "third": "from Jsonenv"}',
			'JSONCONF_1': '{"first": "from Jsonenv", "third": "from Jsonenv"}',
			'JSONCONF_1_AT': 'deep:mounted'
		};
		nconf.overrides({
			third: 'always this',
			deep: {
				mounted: {
					third: 'always this'
				}
			}
		});

		nconf.use('Jsonenv');

		nconf.defaults({
			first: 'will override',
			second: 'stays as-is',
			deep: {
				mounted: {
					first: 'will override',
					second: 'stays as-is',
					third: 'always this'
				}
			}
		});

		const store = nconf.get();
		if (store.type === 'literal') {
			// nconf.defaults() & nconf.overrides() add this by accident
			delete store.type;
		}
		assert.deepStrictEqual(store, {
			first: 'from Jsonenv',
			second: 'stays as-is',
			third: 'always this',
			deep: {
				mounted: {
					first: 'from Jsonenv',
					second: 'stays as-is',
					third: 'always this'
				}
			}
		});
	});
});
