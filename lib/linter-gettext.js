'use babel';

export default {
  config: {
    execPath: {
      type: 'string',
      default: 'msgfmt'
    }
  },

  activate: () => {
    require('atom-package-deps').install('linter-gettext');
  },

  provideLinter: () => {
    const helpers = require('atom-linter');
    const regex = String.raw`(?<file>[^:]+):(?<line>\d+):(?:(?<col>\d+):)? ((?<type>\w+): (?<message>.+)|(?<message>.+))`;
    return {
      name: 'gettext',
      grammarScopes: ['source.po'],
      scope: 'file',
      lintOnFly: false,

      lint: (activeEditor) => {
        const command = atom.config.get('linter-gettext.execPath');
        const file = activeEditor.getPath();
        const args = ['--check', file, '--output-file=/dev/null'];
        const options = {
          stream: 'stderr',
          allowEmptyStderr: true
        };

        return helpers.exec(command, args, options).then(output => {
          let ret = helpers.parse(output, regex);
          // Errors aren't part of the message only warnings
          for (let entry of ret) {
            if (!entry.type) {
              entry.type = 'error';
            }
          }
          return ret;
        });
      }
    };
  }
};