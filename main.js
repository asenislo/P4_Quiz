const readline = require('readline');

const {log, biglog, errorlog, colorize} = require("./out");

const cmds = require("./cmds");

const net = require("net");


net.createServer(socket => { //creamos es socket servidor,  Toma como parametro el socket que nos conecta con el cliente y entre llaves el cuerpo
  
  console.log("Se ha conectado un cliente desde " + socket.remoteAddress); //INdica desde donde se ha conectado el cliente

  //Mensaje inicial AHORA TODO DENTRO DEL SOCKET
  biglog(socket, 'CORE Quiz', 'green');

  const rl = readline.createInterface({
    input: socket,
    output: socket,
    prompt: colorize("quiz>", 'blue'),
    
    completer : (line) => {
      const completions = 'h help add delete edit list test p play credits q quit'.split(' '); //Todos mis comandos para que completer te muestre los que pueden ser
      const hits = completions.filter((c) => c.startsWith(line));
     // show all completions if none found
      return [hits.length ? hits : completions, line]; //devuelve array con los posibles comandos que se pueden teclear cuando de a tabulador
    }
  });

  socket
  .on("end", () => {rl.close(); }) //atiendo al evento end para cuando cliente cierre conexion cerrar readline y no seguir leyendo lineas
  .on("error", () => {rl.close(); }) //si hay un error tambien cierro readline



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
          cmds.helpComand(socket, rl);
        break;

      case 'quit':
      case 'q':
        cmds.quitComand(socket, rl);
        break;

      case 'add': 
        cmds.addComand(socket, rl);
        break;

      case 'list':
        cmds.listComand(socket, rl);
        break;

      case 'show':
        cmds.showComand(socket, rl, args[1]);
        break;

      case 'test':
        cmds.testComand(socket, rl, args[1]);
        break;

      case 'play':
      case 'p':
        cmds.playComand(socket, rl);
        break;

      case 'delete':
        cmds.deleteComand(socket, rl, args[1]);
        break;

      case 'edit':
        cmds.editComand(socket, rl, args[1]);
        break;

      case 'credits':
        cmds.creditsComand(socket, rl);
        break;

      default:
        log(socket, `Comando desconocido: ' ${colorize(cmd, 'red')}'`);
        log(socket, `Use ${colorize('help', 'yellow')} para ver todos los comandos disponibles.`);
        rl.prompt();
        break;
    }
  })
  .on('close', () => {
    log(socket, 'Done, Good bye!');
  });
})

.listen(3030); //queremos que se conectre por los puertos 3030




