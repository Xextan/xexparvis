var shortDescriptions = {};

for (let i = 0; i < dict.length; i++) {
  shortDescriptions[dict[i].word] = dict[i].def;
}

if (typeof module === 'object') {
    module.exports.shortDescriptions = shortDescriptions
}