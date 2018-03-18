

const {models} = require('./model'); //con los corchetes ya tengo sequelize
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
	models.quiz.findAll() //promesa que devuelve todos los quizzes existentes
	//.then(quizzes => { FUNCION ALTERNATIVA ABAJO
		//quizzes.forEach(quiz => { //quizzes es un array porque findAll te devuelve un array y en cada interaccion me devuelve un quiz foreach(quiz)
	     //log(`[${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`); //pongo el campo question que devuelve del quiz que toque
		//lo de catch de abajo
	.each(quiz => { // el each ya recorre aca elemento del array = funciones arriba 
		log(`[${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`); //pongo el campo question que devuelve del quiz que toque
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	}); 
};


 const validateId = id => { //pasa por parametro id
   return new Promise((resolve,reject) => {
     if (typeof id === "undefined"){
       reject(new Error(`Falta el parámetro <id>.`));
     } else {
       id = parseInt(id); //coge la parte entera y rechaza lo demas
       if (Number.isNaN(id)){
         reject(new Error(`El valo r del parámetro <id> no es un número.`));

       } else {
         resolve(id);
       }
     }
   });
 };
/**
* Muestra el quiz indicado en el parámetro: Pregunta y respuesta
*
* @param id CLave del quiz a mostrar
*/
exports.showComand = (rl, id) =>{
    validateId(id) //devuelve una promesa
    .then(id => models.quiz.findById(id)) //si funciona bien ovy a modelo quiz y le paso el id que quiero
    .then(quiz => { //registro el siguiente codigo y compruebo si la promesa anterior me ha devuelto el quiz adecuado
      if (!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`);
      }
      log(`[${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(error => {
      errorlog(error.message);
    })
    .then(() => {
      rl.prompt();
    });
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
				//var respToComand = respSEspacio.toLowerCase(); //mayus a minus

				//var respCorrecta = quiz.answer.toLowerCase();

				if (respSEspacio.toLowerCase() === quiz.answer.toLowerCase()){
					log('Respuesta :');
					biglog('CORRECTA', 'green');
					log('Respuesta correcta !');
				}else{
					log('Respuesta :');
					biglog('INCORRECTA', 'red');
					log('Respuesta incorrecta, inténtelo de nuevo:');
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
	let score = 0;
	let toBeResolved = [];
	let allQuizzes = model.getAll(); // recuperamos de model todas las preguntas que hay en el quiz para interactuar con ellas
	toBeResolved.lenght = model.count();
	let longToBeResolved = toBeResolved.length;

	
	//enumera el toBeResolved para darle un inteficador a cada pregunta
	for(let i = 0; i< model.count(); i++){
		toBeResolved[i] = i;
	}

	const playOne = () => {
		
		if (toBeResolved.lenght === 0) {
			log('Quiz finalizado, tu puntuación es: ', 'green');
			biglog(score, 'magenta');
			rl.prompt();
		}else{

			let id = Math.floor(Math.random()*longToBeResolved); // .
			var quizRun = toBeResolved[id];
			const quiz = model.getByIndex(id);
			//toBeResolved.splice(id,1); // empiezas a borrar en la posicion id y borras un elemento (el de la pos id en este caso) de toBeresolved
			//let quizRun = allQuizzes[id]; //quiz aleatorio con identif id que querremos que se conteste y despues eliminar

			//allQuizzes.splice(id, 1); //eliminamos el quiz que ya se ha ejecutado
			//rl.question(console.log(colorize(`${quizRun.question}?`, 'red')), resp =>{
			log(`¿ ${quiz.question}? `);
			//allQuizzes.splice(id, 1);

			rl.question(colorize('Introduzca la respuesta: ', 'red'), answer =>{
				var respuestaTecleada = answer.toLowerCase().trim();
				var respuestaQuiz = quiz.answer.toLowerCase().trim();
					//if (respuestaTecleada.toLowerCase() === respuestaQuiz.toLowerCase()) {
				if (respuestaTecleada === respuestaQuiz){
						//score = score +1;
					score ++;
					biglog('CORRECTA', 'green');
					log(`Respuesta correcta, tu número de aciertos es ${score}`);
						//if(score < longToBeResolved){
					toBeResolved.splice(id,1);
					playOne();
						//}else{
						//	log('Todas las respuestas son correctas');
							//rl.prompt();
						//}
					
				}else {
					biglog('INCORRECTA', 'red');
					log('Fin del juego, su puntuaciónes:', 'blue' );
					biglog(score,'magenta');
					rl.prompt();
				}
			});
		}

	}
	playOne();
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

