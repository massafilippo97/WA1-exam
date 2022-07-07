'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

// modules for accessing the DB
const questions_dao = require('./questions_dao'); 
const users_dao = require('./users_dao'); 

/*** Set up Passport ***/
passport.use(new LocalStrategy(
    function(username, password, done) {
        users_dao.getUserInfo(username, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'Incorrect username and/or password.' });
          
            return done(null, user);
        })
    }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
  // starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    users_dao.getUserInfoById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
            done(err, null);
        });
});

// Create application
const app = express();
const PORT = 3001;

//middlewares setup list
app.use(morgan('dev'))
app.use(express.json()); //for parsing json request body

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
        return next();
    
    return res.status(401).json({ error: 'not authenticated'});
}
  
// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false 
}));
  
  // then, init passport
app.use(passport.initialize());
app.use(passport.session());


/* --- Questions API --- */

//ottieni tutti i questionari (visibili a tutti o solo quelli personalmente creati)
app.get('/api/questionnaires',[
    check('author').custom(value => {
        if(Number.isInteger(parseInt(value)) && parseInt(value) >= 0)
            return true;
        else
            throw new Error('Value not supported');            
    })
], async (request , response) => {
    try {
        const errors = validationResult(request);
        if(!errors.isEmpty())
            return response.status(422).json({errors: errors.array()});

        //setTimeout(async () => {
        const questionnaires = await questions_dao.questionnairesList(request.query.author);
        response.json(questionnaires);
        //}, 1000);
    }
    catch (err) {
        response.status(500).end();
    }
});

//ottieni tutte le domande associate ad un questionario
app.get('/api/questions',[
    check('questionnaire_id').isInt({min: 1})
], async (request , response) => {
    try {
        const errors = validationResult(request);
        if(!errors.isEmpty())
            return response.status(422).json({errors: errors.array()});

        //setTimeout(async () => {
        const questions = await questions_dao.questionsList(request.query.questionnaire_id);
        response.json(questions);
        //}, 1000);
    }
    catch (err) {
        response.status(500).end();
    }
});


//ottieni tutte le risposte associate alle compilazioni di uno specifico questionario
app.get('/api/answers',[
    check('questionnaire_id').isInt({min: 1}) //id == id sessione compilazione risposte 
],  async (request , response) => {
    try {
        const errors = validationResult(request);
        if(!errors.isEmpty())
            return response.status(422).json({errors: errors.array()});

        //setTimeout(async () => {
        const answers = await questions_dao.answersList(request.query.questionnaire_id);
        response.json(answers);
        //}, 1000);
    }
    catch (err) {
        response.status(500).end();
    }
});



//aggiungi un nuovo questionario
app.post('/api/questionnaires', isLoggedIn, [
    check('title').isString(),
    check('questions').custom(value => {
        let validation_check = true;


        for (let i = 0; i < value.length; i++) {
            if(value[i].type < 0 || value[i].type > 1) 
                validation_check = false;
            if(typeof value[i].question_text !== 'string') 
                validation_check = false; 
            if(value[i].min_ans_required < 0)
                validation_check = false;
            if(value[i].max_ans_required <= 0)
                validation_check = false;
            if(value[i].total_num_answers <= 0)
                validation_check = false; 
            if(typeof value[i].answers !== 'object' && value[i].answers.length !== 10)
                validation_check = false;
        }

        if(validation_check)
            return true;
        else
            throw new Error('Questions format not recognised/supported');            
    })
], async (request , response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty())
        return response.status(422).json({errors: errors.array()});

    try {
        //setTimeout(async () => {
        let max_id = await questions_dao.searchMaxIDQuestionnaire();

        if(max_id === null) //nel caso in cui la tabella dei questionari fosse vuota
            max_id = 1;
        else
            max_id++;

        const new_questionnaire = {
            id: max_id,
            title: request.body.title,
            author: request.user.id,
            tot_answers: 0            
        };

        await questions_dao.createNewQuestionnaire(new_questionnaire);


        let max_id_ans = await questions_dao.searchMaxIDQuestion();

        for (let index = 0; index < request.body.questions.length; index++) {
            const new_question = {
                id : max_id_ans === null ? (1+index) : ((max_id_ans+1) + index),
                type : request.body.questions[index].type,
                question_text : request.body.questions[index].question_text,
                answers : request.body.questions[index].answers,
                total_num_answers : request.body.questions[index].total_num_answers,
                min_ans_required : request.body.questions[index].min_ans_required,
                max_ans_required : request.body.questions[index].max_ans_required,
                questionnaire_id : max_id       
            };
            await questions_dao.insertNewQuestion(new_question);
        }

        response.status(201).end();
        //}, 1000);
    }
    catch (err) {
        response.status(503).end();
    }
});


//aggiungi risposte di un visitatore su un questionario
app.post('/api/answers', [ 
    check('answers').custom(value => {
        let validation_check = true;

        for (let i = 0; i < value.length; i++) {
            if(value[i].question_id < 0)
                validation_check = false;
            if(typeof value[i].author_name  !== 'string')
                validation_check = false;
            if(typeof value[i].answer !== 'object' && value[i].length !== 10)
                validation_check = false;
        }

        if(validation_check)
            return true;
        else
            throw new Error('Answers format not recognised/supported');            
    })
], async (request , response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty())
        return response.status(422).json({errors: errors.array()});

    try {
        //setTimeout(async () => {
        let max_id = await questions_dao.searchMaxIDAnswers();

        if(max_id === null) //nel caso in cui la tabella dei questionari fosse vuota
            max_id = 1;
        else
            max_id++;

        for (let index = 0; index < request.body.answers.length; index++) {
            const answer = {
                id: max_id,
                question_id: request.body.answers[index].question_id, 
                author_name: request.body.answers[index].author_name,
                answer: request.body.answers[index].answer           
            };
    
            await questions_dao.insertNewAnswer(answer);
        }
        let questionnaire_id = await questions_dao.findIdFromQuestionId(request.body.answers[0].question_id);
        await questions_dao.updateNumberOfAnswers(questionnaire_id);

        response.status(201).end();
        //}, 1000);
    }
    catch (err) {
        response.status(503).end();
    }
});

/* - END Questions API - */
/* --------------------- */
/* ----- Users API ----- */

// POST /sessions (login)
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) {
          // display wrong login messages
          return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
          if (err)
              return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUser()
          return res.json(req.user);
      });
  })(req, res, next);
});



// DELETE /sessions/current (logout)
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current (check whether the user is logged in or not)
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
      res.status(200).json(req.user);}
  else
      res.status(401).json({error: 'Unauthenticated user!'});;
});

/* -- END Users API -- */

// activate the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});