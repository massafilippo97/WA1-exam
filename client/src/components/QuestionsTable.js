import { FormModal } from "./FormModal";
import { Button, Col, Row, ListGroup, Alert, Form, ButtonGroup} from "react-bootstrap";
import { Switch, Route, Link, useLocation, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
//import { Question } from './../models/Question'
import API from '../API.js'
import { Answer } from "../models/Answer";

//lista di domande da editare (se amministratore) o compilare (se visitatore)
//let test = [new Question(1,0,"aa",0,1,1), new Question(2,0,"aa",0,1,1)]

function create2DArray(rows,columns) {
	var a = [ ];
	for(var i = 0; i < rows; ++i) {
		a[i] = [ ];
		for(var j = 0; j < columns; ++j) {
			a[i][j] = false; 
		}
	}
	return a;
}

function createArrayEmptyString(num_elements){
	var a = [ ];
	for(var i = 0; i < num_elements; ++i) {
		a[i] = '';
	}
	return a;
}

function createArrayBoolean(num_elements, value){
	var a = [ ];
	for(var i = 0; i < num_elements; ++i) {
		a[i] = value;
	}
	return a;
}


function QuestionsTable(props) {
	const location = useLocation();
	const history = useHistory();
	const [questions, setQuestions] = useState([]);
	const [answers, setAnswers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loading2, setLoading2] = useState(false);
	const [dismissibleMessage, setDismissibleMessage] = useState('');

	const [intervieweeName, setIntervieweeName] = useState('')
	const [radioValues, setRadioValues] = useState(0);
	const [checkboxValues, setCheckboxValues] = useState(0);
	const [textAreaValues, setTextAreaValues] = useState(0);

	const [radioValidationFlags, setRadioValidationFlags] = useState(0);
	const [checkboxValidationFlags, setCheckboxValidationFlags] = useState(0);
	const [textareaValidation1Flags, setTextAreaValidation1Flags] = useState(0);
	const [textareaValidation2Flags, setTextAreaValidation2Flags] = useState(0);
	const [intervieweeNameValidation1, setintervieweeNameValidation1] = useState(true);
	const [intervieweeNameValidation2, setintervieweeNameValidation2] = useState(true); 

	const handleErrors = (err) => { //utile alla visualizzazione degli errori provenienti da chiamate API POST
		if(err.errors)
			setDismissibleMessage({msg: err.errors[0].msg + ': ' + err.errors[0].param, type: 'danger'});
		else
			setDismissibleMessage({msg: err.error, type: 'danger'});
		
		console.error(err);
		//setDirty(true);
	}


	//----------------------------------------------//
	//----- gestione compilazione questionario -----//
	//----------------------------------------------//

	useEffect ( () => {
		const fetchQuestions = async () => {
			setLoading(true); //abilita avviso di loading
			try {
				let temp = await API.fetchQuestions(props.questionnaireId);

				//inizializza i seguenti stati
				setQuestions(temp);

				setRadioValues(create2DArray(temp.length, 10)); //matrice temp.length x numero risposte
				setCheckboxValues(create2DArray(temp.length, 10));
				setTextAreaValues(createArrayEmptyString(temp.length));

				setRadioValidationFlags(createArrayBoolean(temp.length, true));
				setCheckboxValidationFlags(createArrayBoolean(temp.length, true));
				setTextAreaValidation1Flags(createArrayBoolean(temp.length, true));
				setTextAreaValidation2Flags(createArrayBoolean(temp.length, true));
				
				//rimuovi avviso
				setLoading(false);
			}
			catch(err) {
				setDismissibleMessage({msg: "We're having some problems fetching all the data related to the chosen questionnaire.. Please, try again later!", type: 'danger'});
				console.error(err);	
			}
		};
		//fetchQuestions non deve partire se non si visualizza un questionario, cioè se lo si vuole o compilare [questo componente si occupa anche di creare da zero un nuovo questionario, dove l'esecuzione di tale useEffect è inutile]
		if(props.questionnaireId !== 0 && props.questionnaireId !== -1) fetchQuestions();
	}, [props.questionnaireId] ); 

	const setRadioButtonAnswer = (question_index, answer_index) => {
		let shallow = [...radioValues];
		let temp =createArrayBoolean(10, false); 
		temp[answer_index] = true;
		shallow[question_index] = temp;
		//rimuovi il vecchio valore selezionato e sostituiscilo con il nuovo valore corrente
		setRadioValues(() => shallow); 
	};

	const setCheckboxAnswer = (question_index, answer_index) => {
		//inverti il valore precedentemente selezionato (true --> false oppure false --> true)
		let shallow =  [...checkboxValues];
		shallow[question_index][answer_index] = !checkboxValues[question_index][answer_index];

		setCheckboxValues(() => shallow); 
	};

	const setTextAreaAnswer = (question_index, answer) => {
		let shallow = [...textAreaValues];
		shallow[question_index] = answer;
		setTextAreaValues(() => shallow);
	};


	const handleQuestionnaireAnswersSubmit = (event) => {
		//event.preventDefault();

		setRadioValidationFlags(createArrayBoolean(questions.length, true));
		setCheckboxValidationFlags(createArrayBoolean(questions.length, true));
		setTextAreaValidation1Flags(createArrayBoolean(questions.length, true));
		setTextAreaValidation2Flags(createArrayBoolean(questions.length, true));
		setintervieweeNameValidation1(true);
		setintervieweeNameValidation2(true);

		let validation_check = true;
		let validation_array1 = createArrayBoolean(questions.length, true);
		let validation_array2 = createArrayBoolean(questions.length, true);

		//validazione nome
		if(intervieweeName === '') {
			setintervieweeNameValidation1(false);
			validation_check = false;
		}
		if(intervieweeName.length > 30){
			setintervieweeNameValidation2(false);
			validation_check = false;
		}

		//validazione radiobuttons
		for (let question_index = 0; question_index < questions.length; question_index++) {
			//ignora se sei una domanda a risposta aperta o una domanda con checkboxes 
			if(questions[question_index].type === 0 || questions[question_index].max_ans_required !== 1)
				continue; 

			//se non è stata selezionata una risposta ma la domanda è obbligatoria
			if(!radioValues[question_index].includes(true) && questions[question_index].min_ans_required ===1) {  
				validation_array1[question_index] = false;
				if(validation_check) 
					validation_check = false    //basta settarlo a false solo una volta
			}
		}
		setRadioValidationFlags(validation_array1);


		validation_array1 = createArrayBoolean(questions.length, true);
		//validazione checkboxes
		for (let question_index = 0; question_index < questions.length; question_index++) {
			//ignora se sei una domanda a risposta aperta o una domanda con radiobuttons
			if(questions[question_index].type === 0 || questions[question_index].max_ans_required === 1)
				continue;   
			
			//se non è stata selezionata almeno una risposta ma la domanda è obbligatoria oppure se sono state selezionate più risposte di quelle espressamente richieste 
			if(checkboxValues[question_index].filter(x => x).length < questions[question_index].min_ans_required || checkboxValues[question_index].filter(x => x).length > questions[question_index].max_ans_required) { 
				validation_array1[question_index] = false;
				if(validation_check) 
					validation_check = false    //basta settarlo a false solo una volta
			}
		}
		setCheckboxValidationFlags(validation_array1);


		validation_array1 = createArrayBoolean(questions.length, true);
		//validazione textareas
		for (let question_index = 0; question_index < questions.length; question_index++) {
			//se sei una domanda a scelta multipla, ignora
			if(questions[question_index].type === 1 )
				continue;

			//hai lasciato il campo vuoto ma la domanda è obbligatoria
			if(textAreaValues[question_index] === '' && questions[question_index].min_ans_required === 1){ 
				validation_array1[question_index] = false;
				if(validation_check) 
					validation_check = false    //basta settarlo a false solo una volta
			}
			//Se hai superato 200 caratteri
			if(textAreaValues[question_index].length > 200){ 
				validation_array2[question_index] = false;
				if(validation_check) 
					validation_check = false    //basta settarlo a false solo una volta
			}
		}
		setTextAreaValidation1Flags(validation_array1);
		setTextAreaValidation2Flags(validation_array2);


		if (validation_check) {
			//submit  
			uploadAnswers(buildAnswersObject()); 
		};
	}

	const buildAnswersObject = () => {
		var answers = [ ];
		for (let question_index = 0; question_index < questions.length; question_index++) {
			if(questions[question_index].max_ans_required === 1 && questions[question_index].type === 0) //risposta aperta
			 	answers[question_index] = [textAreaValues[question_index], null, null, null, null, null, null, null, null, null];
			else if(questions[question_index].max_ans_required === 1 && questions[question_index].type === 1) //radiobuttons
				answers[question_index] = radioValues[question_index].map((value) => value ? value : null);
			else //checkbox
				answers[question_index] = checkboxValues[question_index].map((value) => value ? value : null);
		}
		return answers.map((answer, index) => new Answer(0, questions[index].id, intervieweeName, answer));
	}

	const uploadAnswers = async (answers) => { 
		try {
			//setLock(true);
			await API.addAnswers(answers);
			history.replace("/"); 
		} 
		catch(err) {
			handleErrors(err);
		}  
	};
	
	//--------------------------------------------------//
	//----- gestione visualizzazione questionario ------//
	//--------------------------------------------------// 

	const [authorName, setAuthorName] = useState('');
	const [viewIndex, setViewIndex] = useState(0); 

	useEffect ( () => {
		const fetchAnswers = async () => {
			setLoading2(true); //abilita avviso di loading (ha più priorità rispetto a loading)
			try {
				let temp = await API.fetchAnswers(props.questionnaireId);
				setAnswers(temp);
				setAuthorName(temp[viewIndex * questions.length ].author_name);
				setLoading2(false);
			}
			catch(err) {
				setDismissibleMessage({msg: "We're having some problems fetching all the data related to the chosen questionnaire.. Please, try again later!", type: 'danger'});
				console.error(err);	
			}
		};
		//useEffect avviabile solo se si stanno leggendo i risultati di un questionario
		if(props.questionnaireId !== 0 && props.questionnaireId !== -1 && location.state.view_result) fetchAnswers();
	}, [props.questionnaireId, location.state.view_result, viewIndex, questions] ); 


	//--------------------------------------------//
	//----- gestione creazione questionario ------//
	//--------------------------------------------//

	//props.questionnaireId === -1 --> si sta creando un nuovo questionario

	const [localQuestionIndex, setLocalQuestionIndex] = useState(0); 
	const [newQuestionnaireTitle, setNewQuestionnaireTitle] = useState('');
	const [titleValidation1, setTitleValidation1] = useState(true);
	const [titleValidation2, setTitleValidation2] = useState(true); 
	const [emptyQuestionnaireValidation, setEmptyQuestionnaireValidation] = useState(true); 


	const incrementLocalIndex = () => { ;
		setLocalQuestionIndex(() => localQuestionIndex + 1 );
	}

	const addNewQuestion = (new_question)  => {
		setQuestions(() => [...questions, new_question]);
	};

	const shiftQuestionUp = (question_id) => {
		if(question_id !== 0) {
			const victim = questions[question_id-1];  // id 1 --> 2
			const shiftedQuestion = questions[question_id]; //id 2 --> 1

			const temp_list = [...questions];
			shiftedQuestion.id = shiftedQuestion.id - 1;
			victim.id = victim.id + 1;
			temp_list[question_id-1] = shiftedQuestion;
			temp_list[question_id] = victim;

			setQuestions(temp_list);
		}
	} 

	const shiftQuestionDown = (question_id) => {
		if(question_id !== localQuestionIndex-1) {
			const victim = questions[question_id+1];  //id 2 --> 1
			const shiftedQuestion = questions[question_id]; // id 1 --> 2
			
			const temp_list = [...questions];
			shiftedQuestion.id = shiftedQuestion.id + 1;
			victim.id = victim.id - 1;
			temp_list[question_id+1] = shiftedQuestion;
			temp_list[question_id] = victim;

			setQuestions(temp_list);
		}
	} 

	const deleteQuestion = (question_id) => {
		let temp_list = questions.filter(question => question.id !== question_id).map((question, index) => {
			question.id = index;
			return question;
		} ); 
		setQuestions(temp_list);
		setLocalQuestionIndex(() => localQuestionIndex -1);
	} 

	const handleQuestionnaireCreation = (event) => {
		setEmptyQuestionnaireValidation(true);
		setTitleValidation1(true);
		setTitleValidation2(true);

		let validation_check = true;

		if(newQuestionnaireTitle === '') {
			setTitleValidation1(false);
			validation_check = false;
		}
		if(newQuestionnaireTitle.length > 75){
			setTitleValidation2(false);
			validation_check = false;
		}
		if(questions.length === 0) {
			setEmptyQuestionnaireValidation(false);
			validation_check=false;
		}

		if(validation_check) {
			uploadNewQuestionnaire(newQuestionnaireTitle, questions); 
		}
	}

	const uploadNewQuestionnaire = async (title, value) => {
		try {
			//setLock(true);
			await API.addNewQuestionnaire(title, value);
			history.replace("/"); 
		} 
		catch(err) {
			handleErrors(err);
		}  
	};
	

	if(!props.loggedIn || location.state.view_result) //dedicato alla compilazione o alla visualizzazione di un questionario
		return(
			<>
				<Row>
					<Col xs={1} md={2} ></Col>
					<Col xs={10} md={8} >
						<h1 className="page_title">{location.state.view_result ? "Results" :"Now you can start filling in this questionnaire"}</h1>
					</Col>
					<Col xs={1} md={2} ></Col>
				</Row>
				{location.state.view_result ? <></>
					: <Row>
						<Col xs={1} md={2} ></Col>
						<Col xs={10} md={8} >
							<Form> 
								<Form.Group className="mb-3" controlId="title_form"> 
									<Form.Control type="text" placeholder="Insert your name here (*)" value={intervieweeName} onChange={event => setIntervieweeName(event.target.value)}/>
								</Form.Group> 
								<p className = "warning-text" hidden={intervieweeNameValidation1}>Please, insert your name here.</p>
								<p className = "warning-text" hidden={intervieweeNameValidation2}>Exceeded max number of characters allowed (30).</p>
							</Form> 
						</Col>
						<Col xs={1} md={2} ></Col>
					</Row>
				}
				<Row>
					<Col xs={1} md={2} ></Col>
					<Col xs={10} md={8} >
						{dismissibleMessage ? <Alert variant={dismissibleMessage.type} className={"welcome_message"} onClose={() => setDismissibleMessage('')} dismissible><h6 className={"welcome_message"}>{dismissibleMessage.msg}</h6></Alert> : <></>} 
					</Col>
					<Col xs={1} md={2} ></Col>
				</Row>
				<Row> 
					<Col xs={1} md={2} ></Col>
					<Col xs={10} md={8} >
						<Form>
							{loading || loading2  ? <span>Please wait, we're trying to fetch all the necessary data...</span>
								:<><ListGroup variant="flush" id="questionnaire_table">
									{
										questions.map((question, index) => <QuestionRow
											key={question.id}
											question = {question} 
											loggedIn = {props.loggedIn}
											view_result = {location.state.view_result}
											radioValues = {radioValues}
											setRadioButtonAnswer = {setRadioButtonAnswer}
											checkboxValues = {checkboxValues}
											setCheckboxAnswer = {setCheckboxAnswer}
											textAreaValues = {textAreaValues}
											setTextAreaAnswer = {setTextAreaAnswer}
											question_index = {index}
											radioValidationFlag = {radioValidationFlags[index]}
											checkboxValidationFlag = {checkboxValidationFlags[index]}
											textareaValidation1Flag = {textareaValidation1Flags[index]}
											textareaValidation2Flag= {textareaValidation2Flags[index]} 
											answers = {answers[index + questions.length*viewIndex]}
											questionnaireId = {props.questionnaireId}
											shiftQuestionUp = {shiftQuestionUp}
											shiftQuestionDown = {shiftQuestionDown}
											deleteQuestion = {deleteQuestion}
										/>)
									}
								</ListGroup>  
							</>}
						</Form>
					</Col>
					<Col xs={1} md={2} ></Col>
				</Row> {/*bottoni visualizza/compila form*/}
				{loading || loading2 ?  <></>
				:	<Row>
						<Col xs={1} md={2} ></Col> 
						{location.state.view_result ?  
							<>  {/*bottoni visualizza form*/}
								<Col xs={2} className="d-flex justify-content-end">                                   
									<Button className="bottom_view_buttons" disabled={answers.length / questions.length === 1} onClick={() => setViewIndex(() =>{ 
										let num_risposte_utenti = answers.length / questions.length;
										setLoading2(true); 
										return (viewIndex-1 < 0 ? num_risposte_utenti - 1 : viewIndex-1 ) //decrementa e se sei negativo, ritorna al valore max
									})}>
										<i className="fas fa-arrow-left fa-md"></i>
									</Button>
								</Col>  
								<Col xs={6} md={4} className="d-flex justify-content-center text-center" >
									<span className="bottom_view_buttons">Answers of the user called: <b>{authorName}</b></span> 
								</Col>            
								<Col xs={2} className="d-flex justify-content ">
									<Button className="bottom_view_buttons" disabled={answers.length / questions.length === 1} onClick={() => setViewIndex(() =>{
										let num_risposte_utenti = answers.length / questions.length;
										setLoading2(true); 
										return (viewIndex+1 === num_risposte_utenti ? 0 : viewIndex+1 ) //incrementa e se sei sfori, ritorna a zero
									})}>
										<i className="fas fa-arrow-right fa-md"></i>
									</Button>
								</Col> 
							</> 
							: <Col xs={10} md={8}> {/*bottoni compila form*/}
								<Link to="/">
									<Button className="bottom_compile_buttons" >Return back</Button>
								</Link>
								<Button className="bottom_compile_buttons" onClick={handleQuestionnaireAnswersSubmit}>Submit</Button></Col>} 
						<Col xs={1} md={2} ></Col>
					</Row>  
				} 
				{(!loading && !loading2) && location.state.view_result  
					? <Row> {/*bottoni visualizza form*/}
						<Col xs={1} md={2} ></Col> 
						<Col xs={2}/>
						<Col xs={6} md={4} className="d-flex justify-content-center text-center">
							<Link to="/"><Button className="bottom_view_buttons" >Return back</Button> </Link>
						</Col>
						<Col xs={2}></Col> 
						<Col xs={1} md={2} ></Col>
					</Row> 
					: <></>
				}
			</>
		);
	else    //dedicata alla sola creazione del questionario (cioè se l'utente è loggato e view_state === false) 
		return(
			<>
				<Row>
					<Col xs={1} md={2} ></Col>
					<Col xs={10} md={8} >
						<Form>
							<h1 className="page_title">New questionnaire title: </h1>
							<Form.Group className="mb-3" controlId="title_form"> 
								<Form.Control type="text" placeholder="Insert title here" value={newQuestionnaireTitle} onChange={event => setNewQuestionnaireTitle(event.target.value)}/>
							</Form.Group> 
							<span className = "warning-text" hidden={titleValidation1}>Choose a title before submitting your questionnaire.</span>
							<span className = "warning-text" hidden={titleValidation2}>Exceeded max number of characters allowed (75).</span>
						</Form> 
					</Col>
					<Col xs={1} md={2} ></Col>
				</Row>
				<Row> 
					<Col xs={1} md={2} ></Col>
					<Col xs={10} md={8} >
						<Form>  {/*no avviso di loading necessario poichè si sta gestendo tutto in locale*/}
							<ListGroup variant="flush" id="questionnaire_table">
								{
									questions.length === 0 
									? <ListGroup.Item>
										<h4 className={!emptyQuestionnaireValidation ? 'warning-text sub_title' : 'sub_title'}>To create a new question, use the dedicated button below!</h4>
									</ListGroup.Item>
									: questions.map((question, index) => <QuestionRow
										key={question.id}
										question = {question} 
										loggedIn = {props.loggedIn}
										view_result = {location.state.view_result}
										radioValues = {radioValues}
										setRadioButtonAnswer = {setRadioButtonAnswer}
										checkboxValues = {checkboxValues}
										setCheckboxAnswer = {setCheckboxAnswer}
										textAreaValues = {textAreaValues}
										setTextAreaAnswer = {setTextAreaAnswer}
										question_index = {index} 
										radioValidationFlag = {radioValidationFlags[index]}
										checkboxValidationFlag = {checkboxValidationFlags[index]}
										textareaValidation1Flag = {textareaValidation1Flags[index]}
										textareaValidation2Flag = {textareaValidation2Flags[index]}
										answers = {answers[index + questions.length*viewIndex]}
										questionnaireId = {props.questionnaireId}
										shiftQuestionUp = {shiftQuestionUp}
										shiftQuestionDown = {shiftQuestionDown}
										deleteQuestion = {deleteQuestion}
									/>)
								}
							</ListGroup>
							<Link to={{
								pathname: "/questionnaire/add",
								state: {view_result: false}
							}}>
								<Button className = "bottom_create_buttons">Add new Question</Button>
							</Link>
							<Link to="/"><Button className = "bottom_create_buttons">Return back</Button></Link>               
							<Button className = "bottom_create_buttons" onClick={handleQuestionnaireCreation}>Publish</Button>
							<Switch>
								<Route path="/questionnaire/add" render={() => {
									props.setShowModal(true);
									return <FormModal addNewQuestion={addNewQuestion} setShow={props.setShowModal} show={props.showModal} nameAction={"Add new question"} incrementLocalIndex = {incrementLocalIndex} localIndex = {localQuestionIndex} />;
								}}/> 
							</Switch> 
						</Form>
					</Col>
					<Col xs={1} md={2} ></Col>
				</Row>
			</>
		);
}


function QuestionRow(props) {
	return(
		<ListGroup.Item>
			<Row>
				<Col xs={props.loggedIn && !props.view_result?10 : 12} md={props.loggedIn && !props.view_result?10 : 12}>
					<span>
						<b>{props.question.question_text}</b>
						<span className="warning-text" hidden={props.question.min_ans_required === 0}> (*)</span>
					</span>
					{props.question.type ? 
						<> {/*risposta chiusa multipla, a scelta singola [radio] o multipla [checkbox] */} 
							<p className = {(!props.radioValidationFlag || !props.checkboxValidationFlag) && props.questionnaireId !== -1 ? 'warning-text' : ''}>
								{props.question.min_ans_required >= 1 && props.question.max_ans_required !== 1 ? <>(Choose at least {props.question.min_ans_required} answer(s)</> : <></>}
								{props.question.min_ans_required === 0 && props.question.max_ans_required < props.question.total_num_answers && props.question.max_ans_required > 1 ? <>(Choose at least {props.question.min_ans_required} answer(s)</> : <></>} {/* caso (Choose at least 0 answer(s) but no more than 2) con num risposte > 2*/}
								{(props.question.max_ans_required !== props.question.min_ans_required && props.question.max_ans_required !== props.question.total_num_answers && props.question.max_ans_required !== 1) 
									? <> but no more than {props.question.max_ans_required}) </> 
									: (props.question.min_ans_required === 0 || props.question.max_ans_required === 1 ? <></> : <>)</>) 
								} {/*stampa solo se min > 1 ma non devi poter selezionare tutte le risposte, tipo solo 3 rispote su 6 */}
							</p>
							<Form.Group controlId={props.question.id}>
								<div key={props.question.id} className="mb-3">
									{props.question.answers.filter(answer => answer != null).map((answer, index) => <>{props.question.max_ans_required === 1 ? 
										<Form.Check 
											type="radio"
											name={"radio"+props.question.id}
											defaultChecked = {props.view_result ? props.answers.answer[index]: false}
											onChange={event => props.setRadioButtonAnswer(props.question_index, index)}
											id={props.question.id +' '+index}
											label={answer}
											disabled={props.view_result || props.questionnaireId === -1}
										/> : <Form.Check 
											type="checkbox"
											name={"checkbox"+props.question.id}
											defaultChecked = {props.view_result ? props.answers.answer[index]: false}
											onChange={event => props.setCheckboxAnswer(props.question_index, index)}
											id={props.question.id +' '+index}
											label={answer}
											disabled={props.view_result || props.questionnaireId === -1}
										/>}</>) 
									}
								</div>
							</Form.Group> 
						</>                        
						:<> {/*risposta aperta */}
							<p></p>
							<Form.Group controlId={props.question.id}>
								<Form.Control as="textarea" disabled={props.view_result || props.questionnaireId === -1} value={props.view_result ? props.answers.answer[0] : props.textAreaValues[props.question_index]} onChange={event => props.setTextAreaAnswer(props.question_index, event.target.value)}/> 
								{props.questionnaireId !== -1 && !props.view_result? <>
									<span className = "warning-text" hidden={props.textareaValidation1Flag}>This question must not be left unanswered.</span>
									<span className = "warning-text" hidden={props.textareaValidation2Flag}>Exceeded max number of characters allowed (200).</span>
									</> 
									: <></>
								}
							</Form.Group>
						</>}
				</Col>
				{/*bottoni disponibili solo se stai creando un questionario */}
				{props.loggedIn && !props.view_result 
					? <Col xs={2} md={2}><ButtonGroup aria-label="Basic example" className="d-flex align-items-center">
							<Button onClick={() => props.shiftQuestionUp(props.question.id)} ><i className="fas fa-arrow-up fa-lg" ></i></Button>
							<Button onClick={() => props.shiftQuestionDown(props.question.id)}><i className="fas fa-arrow-down fa-lg" ></i></Button>
							<Button onClick={() => props.deleteQuestion(props.question.id)}><i className="fas fa-trash-alt fa-lg" ></i></Button>
						</ButtonGroup> </Col>
					: <></>
				} 
			</Row>
		</ListGroup.Item>
	);
}



export {QuestionsTable}