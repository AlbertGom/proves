import React from 'react'
import { Text, Reply } from '@botonic/react'

export default class extends React.Component{

render(){
    return(
         <>
            <Text>Hola, bienvenido al chat del concesionario!</Text>
            <Text>¿Con qué idioma te sientes más cómodo?
		        <Reply payload='Castellano'>Castellano</Reply>
                <Reply payload='Català'>Català</Reply>
	    </Text>
        </>
        )
   }

 }