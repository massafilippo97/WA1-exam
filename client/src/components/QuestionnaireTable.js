import { Button, Col, Row, ListGroup, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../API.js'

//lista dei questionari disponibili da compilare (se visitatore) o creati (se amministratore)

function QuestionnaireTable(props) {
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissibleMessage, setDismissibleMessage] = useState('');

	useEffect ( () => {
		const fetchQuestionnaires = async () => {
			setLoading(true); //abilita avviso di loading
			try {
				setQuestionnaires(await API.fetchQuestionnaires(0));
				//rimuovi avviso
				setLoading(false);
			}
			catch(err) {
				setDismissibleMessage({msg: "We're having some problems fetching all the questionnaires.. Please, try again later!", type: 'danger'});
				console.error(err);	
			}
		};
		fetchQuestionnaires();
	}, [] ); 


    if(!props.loggedIn) //login non effettuato -->
        return(<>
            <Row>
                <Col xs={1} md={2} ></Col>
                <Col xs={10} md={8} >
                    <h1 className="page_title">Hello! Welcome to the homepage of TooManyQuestions.</h1>
                </Col>
                <Col xs={1} md={2} ></Col>
            </Row>
            <Row>
                <Col xs={1} md={2} ></Col>
                <Col xs={10} md={8} >
                    {dismissibleMessage ? <Alert variant={dismissibleMessage.type} className={"welcome_message"} onClose={() => setDismissibleMessage('')} dismissible><h6 className={"welcome_message"}>{dismissibleMessage.msg}</h6></Alert> : <></>} 
                </Col>
                <Col xs={1} md={2} ></Col>
            </Row>
            <Row> 
                <Col xs= {1} md={2} ></Col>
                <Col xs= {10} md={8} >
                    {loading ? <p>Please wait, we're trying to fetch all the necessary data...</p>
                        : <ListGroup variant="flush" id="questionnaires_table">
                            {
                                questionnaires.length === 0 
                                ? <ListGroup.Item>
                                    <h4 className="sub_title">It seems like there isn't any questionnaire available to be compiled. Please, try again later!</h4>
                                </ListGroup.Item>
                                : questionnaires.map((questionnaire) => <QuestionnaireRow
                                    key={questionnaire.id}
                                    questionnaire = {questionnaire}
                                    loggedIn = {props.loggedIn}
                                    setQuestionnaireId = {props.setQuestionnaireId}
                                />)
                            }
                    
					    </ListGroup> 
                    }
                </Col>
                <Col xs= {1} md={2} ></Col>
            </Row></>
        );
    else //login effettuato --> dashboard
        return(
            <>
                <Row>
                    <Col xs={1} md={2} ></Col>
                    <Col xs={10} md={8} >
                        <h1 className="page_title">Hello! Welcome back to the dashboard of TooManyQuestions.</h1>
                    </Col>
                    <Col xs={1} md={2} ></Col>
                </Row> 
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
                        {loading ? <span>Please wait, we're trying to fetch all the necessary data...</span>
                            : <><ListGroup variant="flush" id="questionnaires_table">
                                {  questionnaires.filter((q) => q.author === props.userInfo.id).length === 0 
                                    ? <ListGroup.Item>
                                        <h4 className="sub_title">It seems like you still haven't created any questionnaires, so try it now by clicking on the button below!</h4>
                                    </ListGroup.Item>
                                    : questionnaires.filter((questionnaire) => questionnaire.author === props.userInfo.id).map((questionnaire) => <QuestionnaireRow
                                        key={questionnaire.id}
                                        questionnaire = {questionnaire}
                                        loggedIn = {props.loggedIn}
                                        setQuestionnaireId = {props.setQuestionnaireId}
                                    />) 
                                }
                            </ListGroup>   
                            <Link to={{
                                pathname: "/questionnaire",
                                state: {view_result: false}
                            }}> 
                                <Button onClick={() => props.setQuestionnaireId(-1)}>Create a new questionnaire</Button>
                            </Link>
                        </>}
                    </Col>
                    <Col xs={1} md={2} ></Col>
                </Row>
            </>
        );

}


function QuestionnaireRow(props) {
    return(
        <ListGroup.Item>
			<Row>
                <Col xs={8} lg={10}>
                    <p><b>{props.questionnaire.title}</b></p>
                    <p>Number of submitted answers: <b>{props.questionnaire.tot_answers}</b></p>
                </Col>
                <Col xs={4} lg={2} className="d-flex justify-content-center text-center">
                    {props.questionnaire.tot_answers === 0 && props.loggedIn  
                        ? <>  {/*caso in cui sei loggato e il questionario possiede 0 risposte --> view results disabilitato */}
                            <OverlayTrigger key={props.questionnaire.id} placement={"bottom"}
                                overlay={
                                    <Tooltip id={`tooltip-${props.questionnaire.id}`}>
                                        Sorry, there are no results avaiable!
                                    </Tooltip>
                                }
                            >
                            <Button variant="secondary" >View results</Button>
                            </OverlayTrigger> 
                        </>
                        : <Link to={{
                            pathname: "/questionnaire",
                            state: {view_result: (props.loggedIn ? true : false)}
                        }}> {/*nel caso in cui sei loggato e il questionario possiede almeno una rispota --> view results abilitato, oppure se non sei loggato --> tasto compila */}
                            {props.loggedIn ? <Button onClick={() => props.setQuestionnaireId(props.questionnaire.id)}>View results</Button>
                            : <Button onClick={() => props.setQuestionnaireId(props.questionnaire.id)}>Compile</Button>}
                        </Link>
                    } 
                </Col>
			</Row>
		</ListGroup.Item>
    );
}

export {QuestionnaireTable}