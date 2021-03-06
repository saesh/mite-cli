#!/usr/bin/env node
'use strict'

const program = require('commander');
const miteApi = require('mite-api');
const bluebird = require('bluebird');
const inquirer = require('inquirer');
const ExternalEditor = require('external-editor');

const pkg = require('./../package.json')
const config = require('./config.js');
const tracker = require('./lib/mite-tracker');

program
  .version(pkg.version)
  .description(
    'Rewrite the note for the given time entry id or use the currently ' +
    'running time entry and edit it’s note'
  )
  .option(
    '-e, --editor',
    'open preferred $EDITOR for editing'
  )
  .arguments('<timeEntryId>')
  .action((timeEntryId) => {
    main(timeEntryId);
  })
  .parse(process.argv);

if (!program.args.length) {
  main(null)
}


function main(timeEntryId) {
  const mite = miteApi(config.get());
  const miteTracker = tracker(config.get());
  const getTimeEntry = bluebird.promisify(mite.getTimeEntry);
  const updateTimeEntry = bluebird.promisify(mite.updateTimeEntry);
  const edit = bluebird.promisify(ExternalEditor.editAsync);

  let promise = null;
  if (!timeEntryId) {
    promise = miteTracker.get()
      .then(result => getTimeEntry(result.tracker.tracking_time_entry.id));
  } else {
    promise = getTimeEntry(timeEntryId);
  }
  promise.then(data => data.time_entry)
    .then(timeEntry => {
      timeEntryId = timeEntry.id;
      if (program.editor) {
        return edit(timeEntry.note).then((editedText) => {
          return { note: editedText }
        });
      }

      const questions = [
        {
          type: program.editor ? 'editor' : 'input',
          name: 'note',
          message: 'Note',
          default: timeEntry.note,
        },
      ];
      return inquirer.prompt(questions);
    })
    .then(entry => updateTimeEntry(timeEntryId, entry))
    .then(() => {
      console.log('Successfully modified note of time entry (id: %s)', timeEntryId);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
