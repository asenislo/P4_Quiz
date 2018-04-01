
const figlet = require('figlet');
const chalk = require('chalk');

/**
*Da color a un string
*
* @param msg Es string al que hay que dat color
* @param color El color con el que pintar msg
* @returns {string} Devuelve el string msg con el color elegido
* Si metemos un color distinto indefinido devuelve el msg en negrita (bold) con el color introducido
*/
const colorize = (msg, color) =>{
	if (typeof color !== "undefined"){
		msg = chalk[color].bold(msg);
	}
	return msg;
};

/**
*Escribe un mensaje de log
*
* @param msg El string a escribir
* @param color Color del texto
* funcion que se llame directamente log y llame a colorize
*/
const log = (socket, msg, color) =>{
	socket.write(colorize(msg, color) + "\n"); //\n retorno de carro
};


/**
*Escribe el mensaje de error Emsg
* @param Emsg Texto del mensaje de erros
* Pone error en rojo, pinta el mensaje de error tambien en rojo detras de dos puntos y como texto de fondo un amarillo brillante
*/
const errorlog = (socket, emsg) => {
	socket.write(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}\n`);
};
/**
*Escribe un mensaje de log grande
* @param msg Tecto a escribir
* @param color Color del texto
* MIsmo metodo que log pero pintandolo con letras grandes (figlet). Llamo a metodo log y lo paso por figlet
*/
const biglog = (socket, msg, color) =>{
	log(socket, figlet.textSync(msg, { horizontalLayout: 'full'}), color);
};

exports = module.exports = {
	colorize,
	log,
	biglog,
	errorlog
};