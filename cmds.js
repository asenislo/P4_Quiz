
const Sequelize = require('sequelize');
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



const makeQuestion = (rl, text) => {
  return new Sequelize.Promise((resolve, reject) => {
    rl.question(colorize(text, 'red'), answer => {
      resolve(answer.trim());
    });
  });
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
  makeQuestion(rl, ' Introduzca una pregunta: ') //promesa que hasta que el usuario no haya tecleado la pregunta que quiere hacer no finaliza
 	  .then(q => {
 	    return makeQuestion(rl, ' Introduzca la respuesta ') //return de la nueva promesa, a es el valor que deveuelve
 	    .then(a => { //anidado para poder acceder al texto de la pregunta q, a es la respuesta
 	      return {question: q, answer: a};
 	    });
 	  })
 	  .then(quiz => {
 	    return models.quiz.create(quiz); //objeto que quiero crear
 	  })
 	  .then((quiz) => { //si se vumple pasa a esta promesa y entonces imprime mensaje
 	    log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
 	  })
 	  .catch(Sequelize.ValidationError, error => { //si es erroneo pasa a esta parte
 	    errorlog('El quiz es erroneo:');
 	    error.errors.forEach(({message}) => errorlog(message));
 	  })
 	  .catch(error => {
 	    errorlog(error.message);
 	  })
 	  .then(() => { // si al dinal todo va bien vuelvo a sacar el prompr
 	    rl.prompt();
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
   return new Sequelize.Promise((resolve,reject) => {
     if (typeof id === "undefined"){
       reject(new Error(`Falta el parámetro <id>.`));
     } else {
       id = parseInt(id); //coge la pa rte entera y rechaza lo demas
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
	validateId(id)
	.then(id => models.quiz.findById(id)) 
	.then(quiz => { //registro el siguiente codigo y compruebo si la promesa anterior me ha devuelto el quiz adecuado
      if (!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`);
      }
      log(`[${colorize(quiz.id,'magenta')}]: ${quiz.question}: `);
      return makeQuestion(rl, ' Introduzca la respuesta: ') 
      .then(a => {
      	if (quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){
      		log("Respuesta incorrecta:");
      		biglog('CORRECTA', 'green');
      	}else{
      		log("Respuesta correcta:");
      		biglog('INCORRECTA', 'red');
      	}

      });
    })
    .catch(Sequelize.ValidationError, error => { //si es erroneo pasa a esta parte
 	    errorlog('El quiz es erroneo:');
 	    error.errors.forEach(({message}) => errorlog(message));
 	  })
 	  .catch(error => {
 	    errorlog(error.message);
 	  })
 	  .then(() => { // si al dinal todo va bien vuelvo a sacar el prompt
 	    rl.prompt();
 	  });
 	};
/**
* Arranca todos los quizzes que hay aleatoriamente
* Ganas si contestas todo bien
*/
exports.playComand = rl =>{
	let score = 0;
	let toBeResolved = [];
/*  let allQuizzes = model.getAll(); // recuperamos de model todas las preguntas que hay en el quiz para interactuar con ellas
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
*/
	const playOne = () => {
		return new Sequelize.Promise((resolve,reject) => {
			let longToBeResolved = toBeResolved.length;
			let id = Math.floor(Math.random()*longToBeResolved); 
			var quizRun = toBeResolved[id];

			if (toBeResolved.lenght === 0) {
				log('Quiz finalizado, tu puntuación es: ', 'green');
				biglog(score, 'magenta');
				resolve();
				return;
			}
			makeQuestion(rl, colorize(quizRun.question + '? ', 'red'))
			.then(a => {
				if(a.toLowerCase().trim() === quizRun.answer.toLowerCase().trim()){
					score = score +1;
					toBeResolved.splice(id,1);
					log(`Respuesta correcta, tu número de aciertos es ${score}`);
					biglog('CORRECTA', 'green');
					biglog(score, 'magenta');
					resolve(playOne());
				}else{
					log(`Respuesta incorrecta`);
					biglog('INCORRECTA', 'red');
					log('Fin del juego, su puntuaciónes:', 'red' );
					biglog(score,'magenta');
					resolve();
				}
			});
		});
	};
   models.quiz.findAll()
        .then(quizzes => {quizzes.forEach(quizRun => {toBeResolved.push(quizRun);});})
        .then(() => playOne())
        .then(() => rl.prompt())
        .catch(err => console.log(err));

};

/**
* Borra un quiz
*
* @param id Clave del quiz que va a borrar
*/
exports.deleteComand = (rl, id) =>{
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}})) //destroy con parametro que quiero destruir es el parametro ide de where
	.catch(error => {
	  errorlog(error.message);
	})
	.then(() => {
	  rl.prompt();
	});
};

/**
* Edita un quiz
* Igual que eel textaco de add
* @param rl Objeto readline usado para implementar el CLI
* @param id Clave del quiz a editar
*/
exports.editComand = (rl, id) =>{
	validateId(id) //promesa para validar que me guata id
   .then(id => models.quiz.findById(id)) //promesa dondebusco la pregunta que tengo que editar por su id
   .then(quiz => {//cuando se cumple la anterior paso como parametro el quiz que se ha encontrado
     if (!quiz){
       throw new Error(`No existe un quiz asociado al id=${id}.`);
     }
     process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0); //detecto si es un TTY, inserto cual es el texto actual de la preg y resp
     return makeQuestion(rl, ' Introduzca la pregunta: ') //editar texto pregunta
     .then(q => { //
       process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
       return makeQuestion(rl, 'Introduzca la respuesta ') //otro makequestion dentro del anterior para que no se pierda cuando aya a indroducir la respesta
       .then(a => { //texto de la preg en q y en a la resp
         quiz.question = q; //edito quiz arriba y cambio el .question opor el nuevo valor q de la preg e igual con answer 
         quiz.answer = a;
         return quiz;
       });
     });
   })
   .then(quiz => { //promesa con el quiz ya cambiado
     return quiz.save(); //lo guardo en ka base de datos
   })
   .then(quiz => { //si tiene exito saco mensaje
     log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
   })
    .catch(Sequelize.ValidationError, error => { //coge kos errores de validacion y coge un array con todos los errores y los muestra
 	    errorlog('El quiz es erróneo:');
 	    error.errors.forEach(({message}) => errorlog(message));
 	  })
 	  .catch(error => {
 	    errorlog(error.message);
 	  })
 	  .then(() => { //saca el prompt para meter el proximo comandod
 	    rl.prompt();
 	  });

};

/**
* Muestra los nombres de los autores de la práctica
*/
exports. creditsComand = rl =>{
	log('Autores de la práctica:');
    log('ANA', 'green');
    rl.prompt();
};

