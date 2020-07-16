import React from 'react'
import { Text,RequestContext } from '@botonic/react'

export default class extends React.Component {

static contextType = RequestContext

  render() {
  let _ = this.context.getString
    return (
      <>
        <Text>{_('text17')}</Text>
      </>
    )
  }
}