import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { CallsBadge } from './CallsBadge';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import { faStarOfLife } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Auth } from 'aws-amplify';
import './header.css';

export const Header = (props: {userName: String}) => {

    return (
        <Navbar collapseOnSelect fixed="top" expand='lg'>

            <Navbar.Brand>
                <NavLink className='nav-link' activeClassName='activeRoute' to='/dashboard'>
                    <span className="brand-logo"><i>STARS</i><span className="brand-logo-sub">Service Desk</span></span>
                </NavLink>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls='responsive-navbar-nav' />

            <Navbar.Collapse id='responsive-navbar-nav'>
                <Nav className="ml-auto" variant='pills' defaultActiveKey='/dashboard' as='ul'>
                    <Nav.Item as='li' className='p-1'>
                        <NavLink className='nav-link' activeClassName='activeRoute' to='/dashboard'>
                            Dashboard{' '}
                            <CallsBadge />
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item as='li' className='p-1'>
                        <NavLink className='nav-link' activeClassName='activeRoute' to='/history'>
                            History
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item as='li' className='p-1'>
                        <NavLink className='nav-link' activeClassName='activeRoute' to='/search'>
                            Search
                        </NavLink>
                    </Nav.Item>
                    </Nav>
                    <NavDropdown title={props.userName} id="user-dropdown">
                        <NavDropdown.Item href="/settings">
                            Settings
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={() => Auth.signOut()}>
                            Log Out
                        </NavDropdown.Item>
                    </NavDropdown>
            </Navbar.Collapse>
        </Navbar>
    )
}