#!/usr/bin/env node
const fs = require('fs');
const glob = require("glob");
const { Command } = require('commander');

const program = new Command('es-in-css');

program
  .arguments('<glob>', 'fileglob for js files to be processed');

program.parse();

const inputGlob = program.args[0];

glob(inputGlob, function (er, files) {
  files.forEach(file => console.log(file));
});

function buildTree(startPath) {
  fs.readdir(startPath, (err, entries) => {
    console.log(entries);
  });
}

buildTree('/home/heida/Projects/Script');

