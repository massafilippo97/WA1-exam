import { Modal, Button, Form, Tab, Tabs } from 'react-bootstrap'
import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Question } from '../models/Question';

function FormModal(props) {
	const history = useHistory();
	const [key, setKey] = useState('open');

	const [question, setQuestion] = useState('');
	const [compulsoryTextAreaFlag, setCompulsoryTextAreaFlag] = useState(false);
	const [minCompulsoryAnswers, setMinCompulsoryAnswers] = useState(0);
	const [maxCompulsoryAnswers, setMaxCompulsoryAnswers] = useState(1);
	const [numberOfAnswers, setNumberOfAnswers] = useState(2);
	
	const [answer1TextArea, setAnswer1TextArea] = useState('');
	const [answer2TextArea, setAnswer2TextArea] = useState('');
	const [answer3TextArea, setAnswer3TextArea] = useState('');
	const [answer4TextArea, setAnswer4TextArea] = useState('');
	const [answer5TextArea, setAnswer5TextArea] = useState('');
	const [answer6TextArea, setAnswer6TextArea] = useState('');
	const [answer7TextArea, setAnswer7TextArea] = useState('');
	const [answer8TextArea, setAnswer8TextArea] = useState('');
	const [answer9TextArea, setAnswer9TextArea] = useState('');
	const [answer10TextArea, setAnswer10TextArea] = useState('');

	const [minMaxValidation, setMinMaxValidation] = useState(true);	//domanda vuota

	const [questionValidation1, setQuestionValidation1] = useState(true);	//domanda vuota
	const [questionValidation2, setQuestionValidation2] = useState(true); //lunghezza > 200

	const [answersValidation1, setAnswersValidation1] = useState(true); //campo vuoto, un messaggio per tutti i campi

	const [answer1Validation2, setAnswer1Validation2] = useState(true); //lunghezza > 200, un messaggio per ogni campo
	const [answer2Validation2, setAnswer2Validation2] = useState(true);
	const [answer3Validation2, setAnswer3Validation2] = useState(true);
	const [answer4Validation2, setAnswer4Validation2] = useState(true);
	const [answer5Validation2, setAnswer5Validation2] = useState(true);
	const [answer6Validation2, setAnswer6Validation2] = useState(true);
	const [answer7Validation2, setAnswer7Validation2] = useState(true);
	const [answer8Validation2, setAnswer8Validation2] = useState(true);
	const [answer9Validation2, setAnswer9Validation2] = useState(true);
	const [answer10Validation2, setAnswer10Validation2] = useState(true);
	

	const clearModal = () => {
		setQuestionValidation1(true);	//domanda vuota
		setQuestionValidation2(true); //lunghezza > 200

		setMinMaxValidation(true);

		setAnswersValidation1(true); //campo vuoto, un messaggio per tutti i campi

		setAnswer1Validation2(true); //lunghezza > 200, un messaggio per ogni campo
		setAnswer2Validation2(true);
		setAnswer3Validation2(true);
		setAnswer4Validation2(true);
		setAnswer5Validation2(true);
		setAnswer6Validation2(true);
		setAnswer7Validation2(true);
		setAnswer8Validation2(true);
		setAnswer9Validation2(true);
		setAnswer10Validation2(true);
	}

	const hideForm = () => {
		props.setShow(false); 
	};

	//----------------------------------------------//

	function editNumAnswers(factor) {
		if(factor >= 2 && factor <=10 ) {
			setNumberOfAnswers(factor);
		}
		//else, do nothing
	}
	
	let elements = [];	//array che contiene da 2 a 10 componenti di tipo AnswerTextArea [riga 237]

	let stateVarArray = [answer1TextArea, answer2TextArea, answer3TextArea, answer4TextArea, answer5TextArea, answer6TextArea, answer7TextArea, answer8TextArea, answer9TextArea, answer10TextArea];
	let setStateArray = [setAnswer1TextArea, setAnswer2TextArea, setAnswer3TextArea, setAnswer4TextArea, setAnswer5TextArea, setAnswer6TextArea, setAnswer7TextArea, setAnswer8TextArea, setAnswer9TextArea, setAnswer10TextArea];
	let stateValidationArray = [answer1Validation2, answer2Validation2, answer3Validation2, answer4Validation2, answer5Validation2, answer6Validation2, answer7Validation2, answer8Validation2, answer9Validation2, answer10Validation2];
	
	//utile alla generazione delle textarea rappresentati le risposte a scelta multipla
	for(let i = 0; i < numberOfAnswers; i++){
		let temp = "answer"+(i+1);
		elements.push(<AnswerTextArea controlId={temp} answer = {stateVarArray[i]} setAnswer = {setStateArray[i]}  answerValidation2 = {stateValidationArray[i]}/>);
	}

	//----------------------------------------------//

	const handleSubmit = (event) => {
		event.preventDefault();
		clearModal();

		let validation_check = true;

		//validazione della textarea dedicata alla domanda
		if (question === '') {
			setQuestionValidation1(false);
			validation_check = false;
		}
		if (question.length > 200) {
			setQuestionValidation2(false);
			validation_check = false;
		}

		if(key === 'closed'){
			//validazione delle combobox min max [min non può essere più grande di max, ma solo minore o uguale]
			if(minCompulsoryAnswers > maxCompulsoryAnswers || minCompulsoryAnswers >= numberOfAnswers || maxCompulsoryAnswers > numberOfAnswers ){
				setMinMaxValidation(false);
				validation_check = false;
			}

			//validazione delle textaree dedicate alle risposte [campi vuoti]
			let emptyAnswersCondition = answer1TextArea === '' || answer2TextArea === '' || (answer3TextArea === '' && numberOfAnswers >= 3) || (answer4TextArea === '' && numberOfAnswers >= 4) || (answer5TextArea === '' && numberOfAnswers >= 5) || (answer6TextArea === '' && numberOfAnswers >= 6) || (answer7TextArea === '' && numberOfAnswers >= 7) || (answer8TextArea === '' && numberOfAnswers >= 8) || (answer9TextArea === '' && numberOfAnswers >= 9) || (answer10TextArea === '' && numberOfAnswers >= 10);
			if (emptyAnswersCondition) {
				setAnswersValidation1(false);
				validation_check = false;
			}
			//validazione delle textaree dedicate alle risposte [lunghezza dei campi]
			if (answer1TextArea.length > 200) {
				setAnswer1Validation2(false);
				validation_check = false;
			}
			if (answer2TextArea.length > 200) {
				setAnswer2Validation2(false);
				validation_check = false;
			}
			if (answer3TextArea.length > 200) {
				setAnswer3Validation2(false);
				validation_check = false;
			}
			if (answer4TextArea.length > 200) {
				setAnswer4Validation2(false);
				validation_check = false;
			}
			if (answer5TextArea.length > 200) {
				setAnswer5Validation2(false);
				validation_check = false;
			}
			if (answer6TextArea.length > 200) {
				setAnswer6Validation2(false);
				validation_check = false;
			}
			if (answer7TextArea.length > 200) {
				setAnswer7Validation2(false);
				validation_check = false;
			}
			if (answer8TextArea.length > 200) {
				setAnswer8Validation2(false);
				validation_check = false;
			}
			if (answer9TextArea.length > 200) {
				setAnswer9Validation2(false);
				validation_check = false;
			}
			if (answer10TextArea.length > 200) {
				setAnswer10Validation2(false);
				validation_check = false;
			}
		}

		if (validation_check) {
			
			let newQuestion = '';

			if(key === 'open') {

				newQuestion = new Question(props.localIndex,0,question,null,1,(compulsoryTextAreaFlag ? 1 : 0),1,-1);
			}
			else {
				const answers = [];
				for (let i = 0; i < 10; i++) {
					if(i < numberOfAnswers)
						answers.push(stateVarArray[i]);
					else
						answers.push(null) ;
				}
				//const answers = JSON.stringify([answer1TextArea, ]);
				newQuestion = new Question(props.localIndex,1,question, answers,numberOfAnswers,parseInt(minCompulsoryAnswers),parseInt(maxCompulsoryAnswers),-1)
			}

			props.addNewQuestion(newQuestion);
			props.incrementLocalIndex();
								
			hideForm();
			history.goBack()
		};
	}

//----------------------------------------------//

	return (
		<>
			<Modal show={props.show} backdrop="static" onHide={hideForm}>
				<Modal.Header closeButton>
					<Modal.Title>{props.nameAction}</Modal.Title>
				</Modal.Header>
				<Tabs
					id="controlled-tab-example"
					activeKey={key}
					onSelect={(k) => setKey(k)}
				>
					<Tab eventKey="open" title="Open">
						<Modal.Body>
							<Form>
								<Form.Group controlId='question'>
									<Form.Label>Write your question here (max 200 charatecter allowed) </Form.Label>
									<Form.Control as="textarea" value={question} onChange={event => setQuestion(event.target.value)} />
									<span className = "warning-text" hidden={questionValidation1}>You must fill this text area.</span>
									<span className = "warning-text" hidden={questionValidation2}>Exceeded max number of characters allowed (200).</span>
								</Form.Group>
								<Form.Group controlId='isCompulsory'>
									<Form.Check type="checkbox" name="checkbox" label={"Is it compulsory?"} value = {compulsoryTextAreaFlag} onClick={(event) => setCompulsoryTextAreaFlag(event.target.value)}></Form.Check>
								</Form.Group>
							</Form>
						</Modal.Body>
					</Tab>
					<Tab eventKey="closed" title="Closed">
						<Modal.Body>
							<Form>
								<Form.Group controlId='question'>
									<Form.Label>Write your question here (max 200 charatecter allowed) </Form.Label>
									<Form.Control as="textarea" value={question} onChange={event => setQuestion(event.target.value)} />
									<span className = "warning-text" hidden={questionValidation1}>You must fill this text area.</span>
									<span className = "warning-text" hidden={questionValidation2}>Exceeded max number of characters allowed (200).</span>
								</Form.Group>
								<Form.Group controlId="selectedMinCompulsoryAnswers">
									<Form.Label>Choose the minimum number of required answers</Form.Label>
									<Form.Control as="select" value={minCompulsoryAnswers} onChange={event => setMinCompulsoryAnswers(event.target.value)}>
										<option>0</option>
										<option>1</option>
										<option>2</option>
										<option>3</option>
										<option>4</option>
										<option>5</option>
										<option>6</option>
										<option>7</option>
										<option>8</option>
										<option>9</option> 
									</Form.Control>
									<span className = "warning-text" hidden={minMaxValidation}>Remember: MIN cannot be higher than MAX and both values cannot be higher than the number of the possible answers.</span>
								</Form.Group>
								<Form.Group controlId="selectedMaxCompulsoryAnswers">
									<Form.Label>Choose the maximum number of required answers</Form.Label>
									<Form.Control as="select" value={maxCompulsoryAnswers} onChange={event => setMaxCompulsoryAnswers(event.target.value)}>
										<option>1</option>
										<option>2</option>
										<option>3</option>
										<option>4</option>
										<option>5</option>
										<option>6</option>
										<option>7</option>
										<option>8</option>
										<option>9</option> 
									</Form.Control>
								</Form.Group>
								<Form.Label>Write the possible answers here (max 200 charatecter allowed per answer, minimum two answers and maximum 10 answers) </Form.Label>
								<span className = "warning-text" hidden={answersValidation1}>You must fill these text areas.</span>
								{
									elements //array che contiene da 2 a 10 componenti di tipo AnswerTextArea
								}
							</Form>
							<Button onClick={() => editNumAnswers(numberOfAnswers+1)} style = {{marginRight: "1.5rem"}}>Add new answer text area</Button>
							<Button onClick={() => editNumAnswers(numberOfAnswers-1)}>Remove one answer text area</Button>
						</Modal.Body>
					</Tab>
				</Tabs>
				<Modal.Footer>
					<Link to={{
						pathname: "/questionnaire",
						state: {view_result: false}
                    }}> 
						<Button variant="secondary" onClick={hideForm}>Close</Button>
					</Link>
					<Button onClick={handleSubmit}>{props.nameAction}</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}


function AnswerTextArea(props) {
	return (
		<Form.Group controlId={props.controlId}>
			<Form.Control as="textarea" value={props.answer} onChange={event => props.setAnswer(event.target.value)} />
			<span className = "warning-text" hidden={props.answerValidation2}>Exceeded max number of characters allowed (200).</span>
		</Form.Group>
	);

}


export { FormModal }
