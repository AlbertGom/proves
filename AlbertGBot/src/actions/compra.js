import React from 'react'
import { RequestContext, Text } from '@botonic/react'

export default class extends React.Component {
  static contextType = RequestContext

  render() {
    let _ = this.context.getString
    return (
      <>
        <Text>
          {_('text5')}
        </Text>
        <Text>{_('text9')}</Text>
      </>
    )
  }
}