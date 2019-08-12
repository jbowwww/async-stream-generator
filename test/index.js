
"use strict";
const assert = require('assert');
const inspect = require('util').inspect;//makeInspect({ depth: 3, /*breakLength: 0,*/ compact: false });
const promisify = require('util').promisify;
const nodePath = require('path');
const { exec } = ({ exec: promisify(require('child_process').exec) });
const FsIterable = require('../index.js');

const log = require('debug')('test/FsIterable');//.extend('log');// log.log = (innerLog => ((...args) => (innerLog('prefix', ...args))))(console.log.bind(console));

describe("FsIterable instance unit test", function() {

	const fsIterable = new FsIterable('./test/data/empty');

	it('should be of type FsIterable with count and progress properties', function() {
		assert.ok(fsIterable instanceof FsIterable && !!fsIterable.count && !!fsIterable.progress);
	});

	it('should be async iterable', function() {
		assert.doesNotThrow(async() => { for await (const i of fsIterable) {} });
	});

	it('should yield 0 items for an empty directory walk', async function() {
		const exePath = nodePath.dirname(__filename);
		const path = nodePath.join(exePath, '/__testdata__');
		await exec(`rm -rf ${path} ; mkdir ${path}`);
		assert.doesNotThrow(() => async function() {
			const fsIterable = new FsIterable(path);
			for await (let fsItem of fsIterable) {
				log(`fsItem: Progress = ${(100 * fsIterable.itemIndex / fsIterable.count.all).toFixed(1)}% fsIterable.progress=${inspect(fsIterable.progress)}fsItem='${inspect(fsItem/*.path*/)}'`);//${inspect(fsItem)}`);
				await new Promise((resolve) => setTimeout(resolve,100));
			}
		});
		log(`Done: ${inspect(fsIterable)}`);
		assert.equal(fsIterable.count.all, 1);
	});

});

process.once('SIGINT', onSigInt);
function onSigInt() {
	log(`fsIterable: ${inspect(fsIterable)}`);
	process.once('SIGINT', quitHandler);
	setTimeout(() => {
			process.off('SIGINT', quitHandler);
			process.once('SIGINT', onSigInt);
		}, 1000);
	function quitHandler() {
		process.nextTick(() => process.exit(0));
	}
};