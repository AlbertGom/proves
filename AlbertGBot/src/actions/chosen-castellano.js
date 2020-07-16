import React from 'react'
import { RequestContext, Text } from '@botonic/react'

export default class extends React.Component {
  static contextType = RequestContext

  render() {
    this.context.setLocale('cast')
    let _ = this.context.getString
    return (
      <>
        <Text>
          {_('text1')} 😊 {_('text2')}
        </Text>
        <Text>{_('text4')}</Text>
      </>
    )
  }
}