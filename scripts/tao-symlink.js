#!/usr/bin/env node

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2018 Open Assessment Technologies SA;
 */

/**
 * CLI tool entry point to manage tao
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */


const program = require('commander');
const pkg     = require('../package.json');
const fs      = require('fs-extra');
const path    = require('path');



program
  .version(pkg.version)
  .parse(process.argv);

const taoPath = program.args.length && program.args[0];

if(taoPath &&  fs.pathExistsSync(taoPath) && fs.pathExistsSync(path.join(taoPath, 'tao/manifest.php'))) {
    const projectRoot = path.resolve(__dirname, '..');
    const destination = path.join(projectRoot, 'src/taodist');

    fs.removeSync(destination);
    fs.ensureSymlinkSync(taoPath, destination);
    console.log(`Sym link created : ${path.resolve(destination)} => ${path.resolve(taoPath)}`);

} else {
    console.log(`The path "${taoPath}" does not exists or is not the root of a TAO instance.`);
    process.exit(1);
}


