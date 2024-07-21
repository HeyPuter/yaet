const axios = require('axios');

const commands = {
    website: {
        command (cmd) {
            return cmd
                .description('open a website')
                .argument('<string>', 'website url')
                ;
        },
        async action ({ args: [url] }) {
            console.log('going to open: ' + url);
            await axios.post('http://et.localhost:1337/open', {
                type: 'website',
                url,
            });
            console.log('done');
        }
    },
    term: {
        command (cmd) {
            return cmd
                .description('open a terminal')
                .argument('[pwd]', 'process working directory')
                ;
        },
        async action ({ args: [pwd] }) {
            await axios.post('http://et.localhost:1337/open', {
                type: 'term',
                pwd,
            });
            console.log('done');
        }
    }
};

const main = async () => {
    const { Command } = require('commander');
    const program = new Command();
    program
        .name('etcmd')
        .description('Electron Terminal')
        .version('0.0.0')
        ;
    
    for ( const name in commands ) {
        const command = commands[name];
        const cmd = program.command(name);
        command.command(cmd)
            .action((...args) => {
                command.action({
                    args,
                    commander: { program, cmd },
                    program_opts: program.opts(),
                    command_opts: cmd.opts(),
                });
            })
    }
    
    program.parse(process.argv);
};

main();
