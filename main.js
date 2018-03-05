const readline = require('readline');

const {log, biglog, errorlog, colorize} = require("./out");

const cmds = require("./cmds");


//Mensaje inicial
biglog('CORE Quiz', 'green');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colorize("quiz>", 'blue'),
  /**
  completer : (line) => {
  	const completions = 'h help add delete edit list test p play credits q quit'.split(' '); //Todos mis comandos para que completer te muestre los que pueden ser
  	const hits = completions.filter((c) => c.startsWith(line));
 	 // show all completions if none found
  	return [hits.length ? hits : completions, line]; //devuelve array con los posibles comandos que se pueden teclear cuando de a tabulador
	}*/
});

rl.prompt();

rl
.on('line', (line) => {

  let args = line.split(" ");
  let cmd = args[0].toLowerCase().trim(); //cojo la 1 palabra, la pongo en minuscula y le quito los blancos

  switch (cmd) {
  	case '':
  		rl.prompt();
  		break;

    case 'h':
    case 'help':
        cmds.helpComand(rl);
      break;

    case 'quit':
    case 'q':
    	cmds.quitComand(rl);
    	break;

    case 'add': 
    	cmds.addComand(rl);
    	break;

    case 'list':
    	cmds.listComand(rl);
    	break;

    case 'show':
    	cmds.showComand(rl, args[1]);
    	break;

    case 'test':
    	cmds.testComand(rl, args[1]);
    	break;

    case 'play':
    case 'p':
    	cmds.playComand(rl);
    	break;

    case 'delete':
    	cmds.deleteComand(rl, args[1]);
    	break;

    case 'edit':
    	cmds.editComand(rl, args[1]);
    	break;

    case 'credits':
    	cmds.creditsComand(rl);
    	break;

    default:
    	log(`Comando desconocido: ' ${colorize(cmd, 'red')}'`);
    	log(`Use ${colorize('help', 'yellow')} para ver todos los comandos disponibles.`);
    	rl.prompt();
    	break;
  }
})
.on('close', () => {
  log('Done, Good bye!');
  process.exit(0);
});


