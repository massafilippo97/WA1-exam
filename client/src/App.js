import AppNavbar from "./components/AppNavbar";
import { LoginForm } from "./components/LoginForm"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container} from "react-bootstrap";
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import API from './API.js'
import { QuestionsTable } from "./components/QuestionsTable";
import { QuestionnaireTable } from "./components/QuestionnaireTable";

function App() {
 
	const [questionnaireId, setQuestionnaireId] = useState(0);

	const [loggedIn, setLoggedIn] = useState(false);
	const [userInfo, setUserInfo] = useState(null);
	const [loginDismissibleMessage, setLoginDismissibleMessage] = useState('');

	const [showModal, setShowModal] = useState(false);

 
/* Gestione sessione utente*/

	useEffect(()=> { //controlla se il server ancora possiede una tua sessione di login attiva
		const checkAuth = async() => {
			try {
				setUserInfo(await API.getUserInfo());
				setLoggedIn(true);
			} catch(err) {
				//console.error(err.error);
			}
		};
		checkAuth();
	}, []);

	const loginUser = async (credentials) => {
		try {
			const temp = await API.loginUser(credentials)
			setUserInfo(temp);
			setLoggedIn(true);
			setLoginDismissibleMessage('');

			//setDismissibleMessage({msg: `Welcome back, ${temp.name}!`, type: 'success'});
		} catch(err) {
			if(err === 'Incorrect username and/or password.') 
				setLoginDismissibleMessage({msg: "Incorrect username and/or password. Please, try again.", type: 'danger'});
			else {
				setLoginDismissibleMessage({msg: "We're experiencing technical difficulties with the login procedure. Please, try again later!", type: 'danger'});
				console.error(err);
			}
		}
	}

	const logoutUser = async () => {
		await API.logoutUser();
		setLoggedIn(false);
		// clean up everything
		setUserInfo(null)
	}

/* fine gestione sessione utente*/

	return (
		<div className="App">
			<Router>
			 <AppNavbar loggedIn = {loggedIn} logoutUser = {logoutUser} loginUser = {loginUser}/>
			 <Container fluid>
			 	<Switch>
				 <Route path="/login" render={() => {
						return <>{loggedIn ? <Redirect to="/" /> : <LoginForm login={loginUser} loginDismissibleMessage = {loginDismissibleMessage} setLoginDismissibleMessage = {setLoginDismissibleMessage} />}</>
					}} />
					<Route path="/questionnaire" render={() => {
						if(questionnaireId === 0)
							return <Redirect to="/"/>
						else
							return <QuestionsTable loggedIn = {loggedIn} showModal = {showModal} setShowModal = {setShowModal} questionnaireId={questionnaireId} setQuestionnaireId = {setQuestionnaireId} />
					}}/>
					<Route path="/" render={() => {
						return <QuestionnaireTable loggedIn = {loggedIn} userInfo = {userInfo} questionnaireId={questionnaireId}  setQuestionnaireId = {setQuestionnaireId} />
					}}/>
				</Switch>
			 </Container>
			</Router>
		</div>
	);
}

export default App;
