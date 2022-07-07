'use strict';
/* Data Access Object (DAO) module for accessing the data contained inside the db */

const sqlite = require('sqlite3');

// open the database 
const db = new sqlite.Database('questionnaire.db', (err) => {
  if(err) throw err;
});

/*
exports.something = (parameter1, parameter2) => {
  return new Promise((resolve, reject) => {
    resolve([parameter1, parameter2]);
  }
*/

exports.questionnairesList = (author_id) => {
  return new Promise((resolve, reject) => {

    let sql_query = "";

    if(author_id === "0"){
      sql_query = "SELECT * FROM questionnaires" //per i visitatori
      db.all(sql_query, [], (err, rows) =>{
        if(err) {
          reject(err);
        return;
        }
        resolve(rows.map((row) => ({ id: row.id, title: row.title, author: row.author, tot_answers: row.tot_answers})));
      });
    }
    else{
      sql_query = "SELECT * FROM questionnaires where author = ?"; //user id, solo i questionari creati dall'amministratore
      db.all(sql_query, [author_id], (err, rows) =>{
        if(err) {
          reject(err);
          return;
        }
        resolve(rows.map((row) => ({ id: row.id, title: row.title, author: row.author, tot_answers: row.tot_answers})));
      });
    
    }
 

  });
};

exports.questionsList = (questionnaire_id) => {
  return new Promise((resolve, reject) => {

    let sql_query = "SELECT * FROM questions where questionnaire_id = ?"; 
        
    db.all(sql_query, [questionnaire_id], (err, rows) =>{
      if(err) {
        reject(err);
        return;
      }

      resolve(rows.map((row) => ({ id: row.id, type: row.type, question_text : row.question_text, answers: JSON.parse(row.possible_answers), total_num_answers: row.total_num_answers, min_ans_required: row.min_ans_required, max_ans_required: row.max_ans_required, questionnaire_id: row.questionnaire_id})));
    });
    
  });
};

exports.answersList = (questionnaire_id) => {
  return new Promise((resolve, reject) => {

    let sql_query = "SELECT a.answer_session_id, a.question_id, a.author_name, a.user_answer FROM answers a, questions q where a.question_id = q.id and q.questionnaire_id = ?"; 
 
    db.all(sql_query, [questionnaire_id], (err, rows) =>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows.map((row) => ({ id: row.answer_session_id, question_id: row.question_id, author_name: row.author_name, answer: JSON.parse(row.user_answer)})));
    });
  });
};


//search the max possible id from all registered questionnaires
exports.searchMaxIDQuestionnaire = () => {
  return new Promise((resolve, reject) => {
    const sql_query = "select max(id) as max_id from questionnaires;";
    db.all(sql_query, [], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows[0].max_id);
    });
  });
}

exports.createNewQuestionnaire = (new_questionnaire) => {
  return new Promise((resolve, reject) => {

    const sql_query = "INSERT INTO questionnaires(id,title,author,tot_answers) values (?,?,?,?)";
    db.run(sql_query, [new_questionnaire.id, new_questionnaire.title, new_questionnaire.author, new_questionnaire.tot_answers], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
}

//search the max possible id from all registered questions
exports.searchMaxIDQuestion = () => {
  return new Promise((resolve, reject) => {
    const sql_query = "select max(id) as max_id from questions;";
    db.all(sql_query, [], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows[0].max_id);
    });
  });
}

exports.insertNewQuestion = (question) => {
  return new Promise((resolve, reject) => {

    const sql_query = "INSERT INTO questions(id,type,question_text,possible_answers,total_num_answers,min_ans_required,max_ans_required,questionnaire_id) values (?,?,?,?,?,?,?,?)";
    db.run(sql_query, [question.id, question.type, question.question_text, JSON.stringify(question.answers), question.total_num_answers, question.min_ans_required, question.max_ans_required, question.questionnaire_id], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
}


//search the max possible id from all registered answers
exports.searchMaxIDAnswers = () => {
  return new Promise((resolve, reject) => {
    const sql_query = "select max(answer_session_id) as max_id from answers;";
    db.all(sql_query, [], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows[0].max_id);
    });
  });
}

exports.insertNewAnswer = (answer) => {
  return new Promise((resolve, reject) => {

    const sql_query = "INSERT INTO answers(answer_session_id,author_name,user_answer,question_id) values (?,?,?,?)";
    db.run(sql_query, [answer.id, answer.author_name, JSON.stringify(answer.answer), answer.question_id ], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
}

exports.findIdFromQuestionId = (question_id) => {
  return new Promise((resolve, reject) => {
    const sql_query = "select questionnaire_id from questions where id = ?";
    db.all(sql_query, [question_id], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows[0].questionnaire_id);
    });
  });
}


exports.updateNumberOfAnswers = (questionnaire_id) => {
  return new Promise((resolve, reject) => {
    const sql_query = "UPDATE questionnaires set tot_answers = tot_answers + 1 where id = ?";
    db.run(sql_query, [questionnaire_id], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
}
