import {Navbar, Button} from 'react-bootstrap'
import { Link,  useHistory } from 'react-router-dom';

function AppNavbar(props) { 
	let history = useHistory();
    return(
        <header className="App-header">
        <Navbar expand="sx" >
            <Navbar.Brand href="/" className="navbar_title">
                <i className="fas fa-clipboard-list fa-lg navbar_element logo_icon" ></i>
                TooManyQuestions
            </Navbar.Brand>
 
            { props.loggedIn ? <Button onClick={() => {props.logoutUser(); history.push("/");}} ><i className="fas fa-door-open fa-lg navbar_element" ></i></Button>: <Link to={{pathname: "/login", state: {clicked: true}}}><Button><i className="fas fa-user-cog fa-lg navbar_element" ></i></Button></Link>}
        </Navbar>
    </header>
    );
}

export default AppNavbar;