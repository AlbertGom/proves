import React from 'react'
import { Text, RequestContext, Reply} from '@botonic/react'

export default class extends React.Component {
  static contextType = RequestContext

  static async botonicInit({ input, session, params, lastRoutePath }) {
    session.name = input.data
    let reminder = 'Opel'
    return { reminder }
  }

  render() {
  let _ = this.context.getString
 if(this.context.session.name=="Audi" || this.context.session.name=="audi"){
  return (
      <>
        <Text>{_('text10')} {this.context.session.name} </Text>
        <Text>{_('text11')}  </Text>
      </>
      )
    }


  else if(this.context.session.name=="opel" || this.context.session.name=="Opel"){
    return (
	   <>
        <Text>{_('text10')} {this.context.session.name} </Text>
        <Text>{_('text13')}  </Text>
      </>

    )
   }
   else if(this.context.session.name=="seat" || this.context.session.name=="Seat"){
       return (
   	   <>
           <Text>{_('text10')} {this.context.session.name} </Text>
           <Text>{_('text12')}  </Text>
         </>

       )
      }

  }
}