import React from 'react'
import { Text, RequestContext, Reply, Button } from '@botonic/react'

export default class extends React.Component {
  static contextType = RequestContext

  static async botonicInit({ input, session, params, lastRoutePath }) {
    session.name = input.data
  }

  render() {
  let _ = this.context.getString
  if(this.context.session.name=="astra"){
    return (
        <>
        <Text>
        {_('text15')} {this.context.session.name}
        <Button url='https://www.opel.es/coches/gama-astra/5-puertas/resumen.html'>Visita Astra</Button>
        </Text>
        </>
      )
    }
     else if(this.context.session.name=="corsa"){
        return (
            <>
            <Text>
            {_('text15')} {this.context.session.name}
            <Button url='https://www.opel.es/coches/gama-corsa/corsa/resumen.html'>Visita Corsa</Button>
            </Text>
            </>
          )
        }
       else  if(this.context.session.name=="A3"){
            return (
                <>
                <Text>
                {_('text15')} {this.context.session.name}
                <Button url='https://www.audi.es/es/web/es/modelos/a3/nuevo-a3-sportback.html'>Visita A3</Button>
                </Text>
                </>
              )
            }
        else if(this.context.session.name=="A4"){
                     return (
                         <>
                         <Text>
                         {_('text15')} {this.context.session.name}
                         <Button url='https://www.audi.es/es/web/es/modelos/a4/a4.html'>Visita A4</Button>
                         </Text>
                         </>
                       )
                     }
       else  if(this.context.session.name=="Q5"){
                       return (
                           <>
                           <Text>
                           {_('text15')} {this.context.session.name}
                           <Button url='https://www.audi.es/es/web/es/modelos/q5/nuevo-audi-q5.html'>Visita Q5</Button>
                           </Text>
                           </>
                         )
                       }

      else if(this.context.session.name=="leon"){
                      return (
                          <>
                          <Text>
                          {_('text15')} {this.context.session.name}
                          <Button url='https://www.seat.es/coches/nuevo-leon-2020/modelo.html'>Visita Leon</Button>
                          </Text>
                          </>
                        )
                      }

    else if(this.context.session.name=="ibiza"){
                return (
                    <>
                    <Text>
                    {_('text15')} {this.context.session.name}
                    <Button url='https://www.seat.es/coches/ibiza-5-puertas/modelo.html'>Visita Ibiza</Button>
                    </Text>
                    </>
                  )
                }

    }



   }