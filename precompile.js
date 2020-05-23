'use strict';

const Handlebars = require('handlebars');
const glob = require('glob');
const fs = require('fs');
const os = require('os');

glob.sync('./src/templates/**/*.hbs').forEach(file => {
    // Read handlebars template as string
    const template = fs.readFileSync(file, 'utf8').toString().trim();

    // Precompile template to spec file, according to Handlebars this spec
    // should be readable by a client, however it does not contain an export.
    const templateSpec = Handlebars.precompile(template, {
        strict: true,
        noEscape: true,
        preventIndent: true,
        knownHelpersOnly: true,
        knownHelpers: {
            equals: true,
            notEquals: true,
        },
    });

    // Wrap the spec with an export statement, so we can import this using require.
    const module = `'use strict'${os.EOL}module.exports = ${templateSpec};`;

    // Write javascript module, this is the file we will import in the generator.
    // This is much faster because we dont need to compile templates on the fly,
    // plus we can load the handlebars/runtime which is quite lightweight.
    fs.writeFileSync(file.replace('.hbs', '.js'), module);
});
