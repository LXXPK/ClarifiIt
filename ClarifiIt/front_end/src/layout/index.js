import React from 'react'
import logo from '../assets/mylogo.png'

const AuthLayouts = ({children}) => {
  return (
    <>
        <header className='flex justify-center items-center py-3 h-20 m-10  '>
            <img 
              src={logo}
              alt='logo'
              width={220}
              height={90}
            />
        </header>

        { children }
    </>
  )
}

export default AuthLayouts
