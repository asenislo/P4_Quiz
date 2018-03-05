const model = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");

/**
*FUNCIONES
*/

/**
*Lista de todos los quizzes
* @param rl Objeto readline usado para implementar el CLI
*
*/
exports.helpComand = rl =>{
	log("Commandos:");
    log(" h|help - MUestra esta ayuda.");
	log(" list - Listar los quizzes existentes.");
	log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
	log(" add - Añadir un nuevo quiz interactivamente.");
	log(" delete <id> - Borrar el quiz indicado.");
	log(" edit <id> - Editar el quiz indicado.");
	log(" test <id> - Probar el quiz indicado.");
	log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log(" credits - Créditos.");
	rl.prompt();
};

/**
* Termina el programa 
*/
exports.quitComand = rl =>{
	rl.close();
};

/**
*Añade un quiz nuevo
*Al añadirlo añades pregunta y respuesta
*
*Hay que recordar que el funcionamiento de la funcion rl.question es asincrono.
*EL prompr hay que sacarlo cuando ya se ha terminado la interaccion con el usuario,
*es decir, la llamada a rl.promtt() se debe hacer en el callback de la segunda
*llamada a rl.question
*
* @param rl Objeto readline usado para implementar el CLI
*/
exports.addComand = rl =>{
	rl.question(colorize('Introduzca una pregunta:', 'red'), question => {
		rl.question(colorize('Introduzca la respuesta:', 'red'), answer => { // llama a question con ese string de introduzca la respuesta, luego se llama a la funcion callback de , answer=> y se ejecuta la funcion que esta descrita debajo
			model.add(question, answer);
			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
			rl.prompt(); //Aqui y no despues porque sino se podria salir antes de acabar
		});
	});
	
};

/**
*Lista de los quizzes existentes
*/
exports.listComand = rl => {
	model.getAll().forEach((quiz,id) => { //getall devuelve el array y el foreach para recorrer
		log(` [${ colorize(id, 'magenta')}]: ${quiz.question}`); //imprime por pantalla cada uno de los quizes
	}); 
	rl.prompt();
};

/**
* Muestra el quiz indicado en el parámetro: Pregunta y respuesta
*
* @param id CLave del quiz a mostrar
*/
exports.showComand = (rl, id) =>{
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	}else{
		try{
			const quiz = model.getByIndex(id); //intento acceder a la pregunta en posicion id y me lo guardo en quiz
			log(` [${ colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		}catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

/**
* Prueba el quiz, hace una pregunta a la que debemos contestar
* @param rl
* @param id CLave del quiz a probar
*/
exports.testComand = (rl, id) =>{
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	}else{
		try{
			const quiz = model.getByIndex(id);
			console.log(colorize(`${quiz.question}?`, 'red'));
			rl.question('Introduzca la respuesta: ', answer => {

				var respLimpia = answer.replace(/[^a-zA-Z]+/g,' '); //Quita simbolos
				var respSEspacio = respLimpia.replace(/\s+/g,' '); //Sin espacios
				var respToComand = respSEspacio.toLowerCase(); //mayus a minus

				var respCorrecta = quiz.answer.toLowerCase();

				if (respSEspacio.toLowerCase() === quiz.answer.toLowerCase()){
					log('Respuesta :');
					biglog('CORRECTA', 'green');
				}else{
					log('Respuesta :');
					biglog('INCORRECTA', 'red');
				}
				rl.prompt();
			});			
		}catch (error){
			errorlog(error.message);
			rl.prompt();
    	}
    }	
};

/**
* Arranca todos los quizzes que hay aleatoriamente
* Ganas si contestas todo bien
*/
exports.playComand = rl =>{
	log('Jugar', 'red');
	rl.prompt();
};

/**
* Borra un quiz
*
* @param id Clave del quiz que va a borrar
*/
exports.deleteComand = (rl, id) =>{
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	}else{
		try{
			model.deleteByIndex(id); //intento acceder a la pregunta en posicion id y me lo guardo en quiz
		}catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

/**
* Edita un quiz
* Igual que eel textaco de add
* @param rl Objeto readline usado para implementar el CLI
* @param id Clave del quiz a editar
*/
exports.editComand = (rl, id) =>{
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	}else{
		try{
			const quiz = model.getByIndex(id); //ir al modelo y coger la question que pida
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0); // 0 no quiero esperar nada, antes de poner la pregunta, yo ya escribo en la pregunta
			rl.question(colorize('Introduzca una pregunta:', 'red'), question => {
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				rl.question(colorize('Introduzca la respuesta:', 'red'), answer => { // llama a question con ese string de introduzca la respuesta, luego se llama a la funcion callback de , answer=> y se ejecuta la funcion que esta descrita debajo
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});
		}catch (error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};

/**
* Muestra los nombres de los autores de la práctica
*/
exports. creditsComand = rl =>{
	log('Autores de la práctica:');
    log('ANA', 'green');
    rl.prompt();
};

