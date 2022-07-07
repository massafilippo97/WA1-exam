import { Questionnaire } from "./models/Questionnaire";
import { Question } from './models/Question'
import { Answer } from './models/Answer'

// call POST /api/sessions (perform login procedure)
async function loginUser(user_credentials) {
	let response = await fetch('/api/sessions', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(user_credentials),
	});
	if(response.ok) {
		const user = await response.json();
		return user;
	}
	else {
		try {
			const errDetail = await response.json();
			throw errDetail.message;
		}
		catch(err) {
			throw err;
		}
	}
}

// call DELETE /api/sessions/current (perform logout procedure)
async function logoutUser() {
	await fetch('/api/sessions/current', { method: 'DELETE' });
}
  
async function getUserInfo() {
	const response = await fetch('/api/sessions/current');
	const userInfo = await response.json();
	if (response.ok) 
		return userInfo;
	else 
		throw userInfo;  // an object with the error coming from the server
}


//---------------------------------------------------------------------------//
//---------------------------------------------------------------------------//

// call GET /api/questionnaires?author (tutti i questionari o solo quelli dell'amministratore)
async function fetchQuestionnaires(author_id) {
	const response = await fetch('/api/questionnaires?author=' + author_id);  //se author_id=0, fetchali tutti altrimenti solo quelli creati dall'amministratore        
	const responseBody = await response.json(); 

	if(response.ok)
		return responseBody.map((questionnaire) => Questionnaire.from(questionnaire))
	else 
		throw responseBody
};

// call GET /api/questions?questionnaire_id (ottieni tutte le domande associate ad uno specifico questionario)
async function fetchQuestions(questionnaire_id) {
	const response = await fetch('/api/questions?questionnaire_id=' + questionnaire_id);          
	const responseBody = await response.json(); 

	if(response.ok)
		return responseBody.map((question) => Question.from(question))
	else 
		throw responseBody
};


// call GET /api/answers?questionnaire_id (ottieni tutte le risposte associate alle compilazioni di uno specifico questionario)
async function fetchAnswers(questionnaire_id) {
	const response = await fetch('/api/answers?questionnaire_id=' + questionnaire_id);          
	const responseBody = await response.json(); 

	if(response.ok)
		return responseBody.map((answer) => Answer.from(answer))
	else 
		throw responseBody
};

// call POST /api/questionnaires (aggiungi un nuovo questionario)
function addNewQuestionnaire(title, questions) { 
	return new Promise((resolve, reject) => {
		fetch('/api/questionnaires', {	
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({            
				title: title,
				questions: questions
			})
		}).then((response) => {
			if(response.ok) 
				resolve(null);
			else 
				response.json().then(obj => reject(obj));
		}).catch(err => { reject({'error': 'Cannot communicate with the server'})});
	});
};

// call POST /api/answers (aggiungi risposte associate alla compilazione di uno specifico questionario)
function addAnswers(answers) { //oggetto che contiene la lista di tutte le risposte e l'id del questionario associato
	return new Promise((resolve, reject) => {
		fetch('/api/answers', {	
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ 
				answers: answers
			})
		}).then((response) => {
			if(response.ok) 
				resolve(null);
			else 
				response.json().then(obj => reject(obj));
		}).catch(err => { reject({'error': 'Cannot communicate with the server'})});
	});
};

const API = {loginUser, logoutUser, getUserInfo, fetchQuestionnaires, fetchQuestions, fetchAnswers, addNewQuestionnaire, addAnswers};
export default API;