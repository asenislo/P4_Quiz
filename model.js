const Sequelize = require('sequelize');

const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});

sequelize.define('quiz', {
	question: {
		type: Sequelize.STRING,
		unique: {msg: "Ya existe esta pregunta"},
		validate: {notEmpty: {msg: "La pregunta no puede estar vacía"}}
	},
	answer: {
		type: Sequelize.STRING,
		validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
	}
});

sequelize.sync()
.then(() => sequelize.models.quiz.count()) //accede a la propiedad model y cuento cuantos hay
.then(count => { 
	if(!count){ //si es 0 cojo y creo varios quizzes con bulkcreate
		return sequelize.models.quiz.bulkCreate([ //pongo el return para que la promesa del then count espere a que se ejecute lo de abajo
			{ question: "Capital de Italia", answer: "Roma" },
			{ question: "Capital de Francia", answer: "París" },
			{ question: "Capital de España", answer: "Madrid" },
			{ question: "Capital de POrtugal", answer: "Lisboa" },
		]);
	}
})
.catch(error => { 
	console.log(error);
});

module.exports = sequelize; //exporto sequielize para poder modificarlos cuando quiera