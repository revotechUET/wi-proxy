
module.exports = function execCommand(cmd, options) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        const process = exec(cmd, options);
        process.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        process.stderr.on('data', (data) => {
            console.log(data.toString());
        });

        process.on('exit', (code) => {
            resolve(code);
        });
    });
};