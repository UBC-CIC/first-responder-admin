import { Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { CallsBadge } from './CallsBadge';
import './header.css';

export const Header = () => {

    return (
        <Navbar collapseOnSelect bg="dark" variant="dark" fixed="top" expand='lg'>

            <Navbar.Brand>
                <NavLink className='nav-link' activeClassName='activeRoute' to='/dashboard'>
                    {
                      //<img src='logo-stars-dark.svg' alt='STARS' className="responsive"/>
                    }
                    STARS - Service Desk
                </NavLink>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls='responsive-navbar-nav'/>

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
                    <Nav.Item as='li' className='p-1'>
                        <NavLink className='nav-link' activeClassName='activeRoute' to='/settings'>
                            Settings
                        </NavLink>
                    </Nav.Item>
                </Nav>
            </Navbar.Collapse>

        </Navbar>
    )
}