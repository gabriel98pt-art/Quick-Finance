#!/usr/bin/env node
// Valida a sintaxe de todos os <script> inline (sem src) de um ficheiro HTML.
// Usa vm.Script só para compilar/parsear — nunca executa o código.
'use strict';
const fs = require('fs');
const vm = require('vm');

const file = process.argv[2];
if (!file) {
  console.error('Uso: node check-inline-js.js <ficheiro.html>');
  process.exit(1);
}

const html = fs.readFileSync(file, 'utf8');
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match, count = 0, failed = false;

while ((match = re.exec(html))) {
  const code = match[1];
  if (!code.trim()) continue;
  count++;
  try {
    new vm.Script(code, { filename: `${file}#script${count}` });
  } catch (err) {
    failed = true;
    console.error(`Erro de sintaxe no <script> #${count} de ${file}:`);
    console.error(err.message);
  }
}

if (count === 0) {
  console.error(`Nenhum <script> inline encontrado em ${file}`);
  process.exit(1);
}
if (failed) process.exit(1);
console.log(`OK — ${count} bloco(s) <script> inline validados em ${file}`);
