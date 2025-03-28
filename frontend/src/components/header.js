import React from 'react';
import '../styles/header.css'

function Header () {
    return(
        <header className='header'>
            <a className='title' href='/'>Home</a>
            <a className='title' href='/Favorites'>Favorites</a>
        </header>
    )

}
export default Header;