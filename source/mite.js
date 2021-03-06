#!/usr/bin/env node
'use strict'

const program = require('commander')

const pkg = require('./../package.json')

program
  .version(pkg.version)
  .command('amend', 'edit the text for a specific time entry or the currently runnning entry')
  .alias('reword')
  .command('config', 'show or set configuration settings')
  .command('delete', 'delete a specific time entry')
  .alias('rm')
  .command('list', 'list time entries', {
    isDefault: true
  })
  .alias('ls')
  .alias('status')
  .alias('st')
  .command('new', 'create a new time entry')
  .alias('create')
  .command('open', 'open the given time entry in browser')
  .command('stop', 'stop any running counter')
  .command('start', 'start the tracker for the given id, will also stop allready running entry')
  .command('users', 'list, filter & search for users')
  .command('projects', 'list, filter & search projects')
  .command('services', 'list, filter & search services')
  .command('customers', 'list, filter & search customers')
  .alias('clients')
  .description(pkg.description)
  .parse(process.argv)
