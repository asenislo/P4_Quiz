
const fs = require("fs");

// El nombre del fichero donde se guardan las preguntas.
// Es un fichero de texto con el JSON de quizzes, creo una cte quizzes.json donde voy a guardar lo de let quizzes
const DB_FILENAME = "quizzes.json";

//     DATOS PREGUNTAS Y RESPUESTAS
/*
*En esta Variable se mantienen todos los quizzes existentes
* Es un array de objetos, donde cada objeto tiene los atributos
* question y answer para guardar el texto de la pregunta y el de la respuesta
*/
let quizzes = [
	{
		question: "Capital de España",
		answer: "Madrid"
	},
	{
		question: "Capital de Italia",
		answer: "Roma"
	},
	{
		question: "Fundador de Tesla",
		answer: "Elon Musk"
	},
	{
		question: "Fundador de Inditex",
		answer: "Amancio Ortega"
	}
];

/**
* Guarda las preguntas en el fichero
* Guarda en formato JSON el valor de quizzes en el fichero DB_FILENAME
* Si se produce algun tipo de error, se lanza una excepcion que abortara
*la ejecucion del programa
*/
const save = () => {

	fs.writeFile(DB_FILENAME,
		JSON.stringify(quizzes),
		err => {
			if (err) throw err;
		});
};

/**
* Este método carga el contenido del fichero DB_FILENAME en la variable
*quizzes. El contenido de este fichero esta en formato JSON.
* La primera vez que se ejecute este método, el fichero DB_FILENAME no
*contenido inicial almacenado en quizzes.
* Si se produce otro tipo de error, se lanza una excepcion que abortara
*la ejecución del programa.
*/
const load = () => {
	
	fs.readFile(DB_FILENAME, (err, data) => {
		if (err) {

			//La primera vez no existe el fichero
			if (err.code === "ENOENT") { //no existe el fichero entonces lo voy a crear save();
				save(); // valores iniciales
				return;
			}
			throw err;
		}
		let json = JSON.parse(data);

		if (json) {
			quizzes = json; 
		}
	});	
};



 /**
 *Devuelve el numero total de preguntas existentes
 * @returns {number} numero total de preguntas existentes
 */
exports.count = () => quizzes.length;

/**
*Añade un quiz
* @param question
* @param answer
*/
exports.add = (question, answer) => {
	quizzes.push({
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

/**
*Actualiza el quiz situado en la posicion index
* @param id Clave que identifica el quiz a actualizar
* @param question String con la pregunta
* @param answer String con la pregunta
*/
exports.update = (id, question, answer) => {
	const quiz = quizzes[id]; //me lo guardo en una variable quizzes por si acaso no existe y lanzar excepcion
	if (typeof quiz === "undefined") {
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	quizzes.splice(id, 1, { // en la posicion id del array quizzes. Voy a cambiar solo 1
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

/**
* Devuelve todos los quizzes existentes
* Devuelve un clon del valor guardado en la variable quizzes, devuelve
* un objeto nuevo con todas las preguntas existentes
* Para clonar quizzes se usa stringify + parse
* @returns {any}
*jason clona
*/
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
* Devuelve un clon del quiz almacenado en la posicion dada
* para clonar stringify + parse
* @param id Clave que identifica el quiz a devolver
* o
* @returns {question, answer} Devuelve el obajeto quiz de la posicion dada
*/
exports.getByIndex = id => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined") {
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	return JSON.parse(JSON.stringify(quiz));
};

/**
* Elimina el quiz situado en la posicion dada
* @param id Clave que identifica el quiz a borrar
*/
exports.deleteByIndex = id => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined") {
		throw new Error(`El valor del parámetro id no es válido.`);
	} 
	quizzes.splice(id, 1);
	save(); // despues de borrarlo lo vuelvo a crear y guardar
};

// Carga los quizzes almacenados en el fichero
load();
