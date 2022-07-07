import { useState } from 'react';
import { Form, Button, Alert, Col, Row } from 'react-bootstrap';

function LoginForm(props) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [usernameValidation, setUsernameValidation] = useState(true);
	const [passwordValidation1, setPasswordValidation1] = useState(true);
	const [passwordValidation2, setPasswordValidation2] = useState(true);

	const handleSubmit = (event) => {
		event.preventDefault();
		setUsernameValidation(true);
		setPasswordValidation1(true);
		setPasswordValidation2(true);

		const credentials = { username, password };
		
		let valid = true;
		if(username === ''){
			valid = false;
			setUsernameValidation(false);
		}
		if(password === '') {
			valid = false;
			setPasswordValidation1(false);
		}
		else if (password.length < 6) {
			valid = false;
			setPasswordValidation2(false);
		}

		if(valid) 
			props.login(credentials);
	};

	return (
		<>
			<Row className= {"align-items-start  login_form"}/>
			<Row className= {"align-items-center login_form"}>
				<Col xs={2} md={4}/>
				<Col xs={8} md={4}>
					<Form>
						{props.loginDismissibleMessage ? <Alert variant={props.loginDismissibleMessage.type} onClose={() => props.setLoginDismissibleMessage('')} dismissible><h6>{props.loginDismissibleMessage.msg}</h6></Alert> : <></>} 
						<h1 style={{textAlign: "center"}}>Login as an Administrator</h1><br/>
						<Form.Group controlId='username'>
							<Form.Label>Username (e-mail address)</Form.Label>
							<Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
							<span className = "warning-text" hidden={usernameValidation}>Username cannot be empty.</span>
						</Form.Group>
						<Form.Group controlId='password'>
							<Form.Label>Password</Form.Label>
							<Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
							<span className = "warning-text" hidden={passwordValidation1}>Password cannot be empty.</span>
							<span className = "warning-text" hidden={passwordValidation2}>Minimum number of characters allowed: 6.</span>
						</Form.Group>
						<Button onClick={handleSubmit}>Login</Button>
					</Form>
				</Col>
				<Col xs={2} md={4}/>
			</Row>
			<Row className= {"align-items-end login_form"}/>
		</>
	)
}

export { LoginForm };