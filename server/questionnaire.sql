/*version 0.3.1*/

BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER NOT NULL,
	"email"	TEXT NOT NULL,
	"name"	TEXT NOT NULL,
	"hash"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "questionnaires" (
	"id"	INTEGER NOT NULL,
	"title"	TEXT NOT NULL, 
	"author"	INTEGER NOT NULL,
	"tot_answers" INTEGER DEFAULT 0,
	PRIMARY KEY("id"),
	FOREIGN KEY("author") REFERENCES "users"("id")
);

/* Agendo su questi valori, si possono ottenere diversi tipi di domande: 
	- min = 0, max = 1 → domanda facoltativa, a scelta singola    [type=0 aperta, type=1 chiusa]
	- min = 1, max = 1 → domanda obbligatoria, a scelta singola   [type=0 aperta, type=1 chiusa]
	- min = 0, max > 1 → domanda facoltativa, a scelta multipla   [possibile solo type=1 chiusa]
	- min >= 1, max > 1 → domanda obbligatoria, a scelta multipla [possibile solo type=1 chiusa]
*/

CREATE TABLE IF NOT EXISTS "questions" (
	"id"	INTEGER NOT NULL,
	"type" INTEGER DEFAULT 0,	/*0 --> open, 1--> closed*/ 
	"question_text" TEXT NOT NULL, 
	"possible_answers" TEXT NOT NULL, /*json object {rispota1: "aaa", risposta2: "bbb",..., "rispota10:"ccc"}*/
	"total_num_answers" INTEGER NOT NULL,
	"min_ans_required" INTEGER NOT NULL,
	"max_ans_required" INTEGER NOT NULL,
	"questionnaire_id"	INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("questionnaire_id") REFERENCES "questionnaires"("id")
);

CREATE TABLE IF NOT EXISTS "answers" (
	"answer_session_id"	INTEGER NOT NULL,
	"question_id"	INTEGER NOT NULL,
	"author_name"	INTEGER,
	"user_answer" TEXT NOT NULL,
	PRIMARY KEY("answer_session_id", "question_id"), 
	FOREIGN KEY("question_id") REFERENCES "questions"("id")
);
/*
primary key(answer_session_id, question_id) poichè in questo modo le risposte ad uno specifico 
questionario sono univocamente identificate sia dal question_id che da answer_session_id 
associato a quella sessione di risposta (entrambi quindi non univoci per tupla)

id		author_name			answer		question_id
1		john				...			1
1		john				...			2
1		john				...			3
2		alice				...			4
2		alice				...			5
3		john				...			4
3		john				...			5

id = 2 e 3 sono due sessioni diverse di rispota eseguite da due utenti diversi sullo stesso questionario
*/

INSERT INTO "users" ("id","email","name","hash") VALUES (1,'demo1@polito.it','John','$2a$12$aLsAp7tDvIEgN9sc5e4yF.hzXSuDdJaUCZxrOUqGOZMwj.y/TjTX2');
INSERT INTO "users" ("id","email","name","hash") VALUES (2,'demo2@polito.it','John','$2a$10$LnJBOURhjVYTT1XPDpQrkeeICr3fPXR06ZcJ7BCjyU/iLMQKuTz1a');


INSERT INTO "questionnaires" ("id","title","author","tot_answers") VALUES (1,'Market Research Form',1,3);
INSERT INTO "questionnaires" ("id","title","author","tot_answers") VALUES (2,'Typical Customer Demographics Form',1,2);
INSERT INTO "questionnaires" ("id","title","author","tot_answers") VALUES (3,'Health Survey',2,2);
INSERT INTO "questionnaires" ("id","title","author","tot_answers") VALUES (4,'Local Cafeteria Survey Form',2,3);


/*market research form*/
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (1,1,'How important is convenience when choosing this type of product?','["Extremely important","Very important","Moderately important","Slightly important","Not at all important",null,null,null,null,null]',5,1,1,1);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (2,0,'What do you like most about competing products currently available from other companies?','null',1,1,1,1);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (3,0,'What changes would most improve competing products currently available from other companies?','null',1,0,1,1);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (4,0,'How would you consider our product useful for your needs?','null',1,1,1,1);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (5,1,'If you are not likely to use our new product, why not?','["Do not need a product like this","Do not want a product like this","Satisfied with competing products currently available","Cannot pay for a product like this","Other", null,null,null,null,null]',6,1,1,1);

/*Typical Customer Demographics Form*/
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (6,1,'How old is your typical customer?','["17 or younger","18-20","21-29","30-39","40-49","50-59","60-64","65 or older",null,null]',8,1,8,2);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (7,1,'What is the highest level of school your typical customer has completed or the highest degree they have received?','["Less than high school degree","High school degree or equivalent (e.g., GED)","Some college but no degree","Associate degree","Bachelor degree","Graduate degree",null,null,null,null]',6,1,1,2);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (8,0,'How would you describe your typical customer?',"null",1,0,1,2);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (9,1,"Which of the following categories best describes your typical customer's employment status?",'["Employed, working 1-39 hours per week","Employed, working 40 or more hours per week","Not employed, looking for work","Not employed, NOT looking for work","Retired","Disabled, not able to work",null,null,null,null]',6,1,6,2);


/*health survey*/
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (10,1,'What is your gender?','["Male", "Female", "Other",null,null,null,null,null,null,null]',3,1,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (11,0,'What is your weight?','null',1,1,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (12,0,'What is your age?','null',1,1,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (13,0,'What is your height?','null',1,1,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (14,1,'Have you ever smoked cigarettes or cigars?','["yes","no",null,null,null,null,null,null,null,null]',2,1,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (15,1,'Did you, or do you currently engage in any of the following exercises?','["Walking","Running","Swimming","Biking","Other","I do not exercise",null,null,null,null]',6,1,6,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (16,0,'If you exercise, on average, how long do you exercise?','null',1,0,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (17,0,'If you walk for exercise, on average, how long does it take you to walk one mile?','null',1,0,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (18,0,'If you bicycle for exercise, on average, how fast is your normal ride?','null',1,0,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (19,0,'On average, how many hours a week do exercise?','null',1,0,1,3);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (20,0,'On average, how many hours a day do you sleep?','null',1,1,1,3);



/*Local cafeteria survey form*/
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (21,1,'How often have you eaten at the Cafeteria?','["Daily","One time per week","Once every two weeks","One time per month","Once every six months","Never",null,null,null,null]',6,1,6,4);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (22,0,'What do you currently think about the employees of the Cafeteria?','null',1,1,1,4);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (23,0,'What do you think of the food selection currently offered by the Cafeteria?','null',1,1,1,4);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (24,1,'From 1 to 10, how would you rate the value of food?','["1","2","3","4","5","6","7","8","9","10"]',10,1,1,4);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (25,1,'How long are you willing to wait for food?','["<15 minutes","15 minutes","30 minutes","40+ minutes",null,null,null,null,null,null]',4,1,1,4);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (26,0,'If you could add to the menu what particular food items would you like to see on the menu?','null',1,1,1,4);
INSERT INTO "questions" ("id","type","question_text","possible_answers","total_num_answers","min_ans_required","max_ans_required","questionnaire_id") VALUES (27,0,'What other suggestions would you have?','null',1,1,1,4);


/*market research form answers*/

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (1,'Bob','[true,null,null,null,null,null,null,null,null,null]',1);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (1,'Bob','["Example answer text 1",null,null,null,null,null,null,null,null,null]',2);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (1,'Bob','["Example answer text 2",null,null,null,null,null,null,null,null,null]',3);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (1,'Bob','["Example answer text 3",null,null,null,null,null,null,null,null,null]',4);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (1,'Bob','[null,null,true,null,null,null,null,null,null,null]',5);

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (3,'Eva','[null,true,null,null,null,null,null,null,null,null]',1);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (3,'Eva','["Example answer text 4",null,null,null,null,null,null,null,null,null]',2);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (3,'Eva','["Example answer text 5",null,null,null,null,null,null,null,null,null]',3);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (3,'Eva','["Example answer text 6",null,null,null,null,null,null,null,null,null]',4); 
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (3,'Eva','[null,true,false,null,null,null,null,null,null,null]',5);

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (4,'Anne','[null,null,true,null,null,null,null,null,null,null]',1);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (4,'Anne','["Example answer text 7",null,null,null,null,null,null,null,null,null]',2);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (4,'Anne','["Example answer text 8",null,null,null,null,null,null,null,null,null]',3);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (4,'Anne','["Example answer text 9",null,null,null,null,null,null,null,null,null]',4);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (4,'Anne','[null,null,true,null,null,null,null,null,null,null]',5);

/*Typical Customer Demographics Form answers*/

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (2,'Arthur','[true,null,true,true,null,null,null,null,null,null]',6);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (2,'Arthur','[null,null,true,null,null,null,null,null,null,null]',7);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (2,'Arthur','["Example answer text 1",null,null,null,null,null,null,null,null,null]',8);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (2,'Arthur','[true,null,true,null,null,null,null,null,null,null]',9);

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (5,'Carl','[true,true,null,true,null,null,null,null,null,null]',6);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (5,'Carl','[null,true,null,null,null,null,null,null,null,null]',7);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (5,'Carl','["Example answer text 2",null,null,null,null,null,null,null,null,null]',8);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (5,'Carl','[true,true,null,null,null,null,null,null,null,null]',9);

/*health survey answers*/

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','[true,null,null,null,null,null,null,null,null,null]',10);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 1",null,null,null,null,null,null,null,null,null]',11);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 2",null,null,null,null,null,null,null,null,null]',12);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 3",null,null,null,null,null,null,null,null,null]',13);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','[null,true,null,null,null,null,null,null,null,null]',14);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','[null,true,true,true,null,null,null,null,null,null]',15);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 4",null,null,null,null,null,null,null,null,null]',16);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 5",null,null,null,null,null,null,null,null,null]',17);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 6",null,null,null,null,null,null,null,null,null]',18);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 7",null,null,null,null,null,null,null,null,null]',19);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (6,'Jon','["Example answer text 8",null,null,null,null,null,null,null,null,null]',20);

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','[null,true,null,null,null,null,null,null,null,null]',10);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["Example answer text 9",null,null,null,null,null,null,null,null,null]',11);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["Example answer text 10",null,null,null,null,null,null,null,null,null]',12);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["Example answer text 11",null,null,null,null,null,null,null,null,null]',13);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','[true,null,null,null,null,null,null,null,null,null]',14);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','[null,null,null,null,null,true,null,null,null,null]',15);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["",null,null,null,null,null,null,null,null,null]',16);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["",null,null,null,null,null,null,null,null,null]',17);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["",null,null,null,null,null,null,null,null,null]',18);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["",null,null,null,null,null,null,null,null,null]',19);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (7,'Jessie','["Example answer text 12",null,null,null,null,null,null,null,null,null]',20);

/*Local cafeteria survey form answers*/

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (8,'Eddie','[true,null,null,null,null,null,null,null,null,null]',21);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (8,'Eddie','["Example answer text 1",null,null,null,null,null,null,null,null,null]',22);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (8,'Eddie','["Example answer text 2",null,null,null,null,null,null,null,null,null]',23);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (8,'Eddie','[null,null,null,null,null,null,null,null,true,null]',24);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (8,'Eddie','[true,null,null,null,null,null,null,null,null,null]',25);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (8,'Eddie','["Example answer text 3",null,null,null,null,null,null,null,null,null]',26);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (8,'Eddie','["Example answer text 4",null,null,null,null,null,null,null,null,null]',27);

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (9,'Denny','[null,null,true,null,null,null,null,null,null,null]',21);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (9,'Denny','["Example answer text 5",null,null,null,null,null,null,null,null,null]',22);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (9,'Denny','["Example answer text 6",null,null,null,null,null,null,null,null,null]',23);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (9,'Denny','[null,null,null,null,null,null,true,null,null,null]',24);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (9,'Denny','[null,null,null,true,null,null,null,null,null,null]',25);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (9,'Denny','["Example answer text 7",null,null,null,null,null,null,null,null,null]',26);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (9,'Denny','["Example answer text 8",null,null,null,null,null,null,null,null,null]',27);

INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (10,'Gabe','[null,null,null,true,null,null,null,null,null,null]',21);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (10,'Gabe','["Example answer text 9",null,null,null,null,null,null,null,null,null]',22);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (10,'Gabe','["Example answer text 10",null,null,null,null,null,null,null,null,null]',23);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (10,'Gabe','[null,null,null,null,null,null,null,null,true,null]',24);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (10,'Gabe','[null,true,null,null,null,null,null,null,null,null]',25);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (10,'Gabe','["Example answer text 11",null,null,null,null,null,null,null,null,null]',26);
INSERT INTO "answers" ("answer_session_id","author_name","user_answer","question_id") VALUES (10,'Gabe','["Example answer text 12",null,null,null,null,null,null,null,null,null]',27);


COMMIT;

