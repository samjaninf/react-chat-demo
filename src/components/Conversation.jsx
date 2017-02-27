import React from 'react';
import skygear from 'skygear';
import skygearChat from 'skygear-chat';

import TypingDetector from '../utils/TypingDetector.jsx';
import ManagedMessageList from '../utils/ManagedMessageList.jsx';
import UserLoader from '../utils/UserLoader.jsx';

import Message from './Message.jsx';

export default class Conversation extends React.Component {
  constructor(props) {
    super(props);
    const {title} = props.conversation;
    this.state = {
      title: title || 'loading...', // conversation title (either group name or participant names)
      users: {},                    // map of userID => user in this conversation
    };
    this.detectTyping = new TypingDetector(props.conversation);
    this.messageList = new ManagedMessageList(props.conversation);
  }
  componentDidMount() {
    const {
      title,
      participant_ids,
    } = this.props.conversation;
    // subscribe message change
    this.messageList.subscribe(_ => {
      this.forceUpdate();
    });
    // fetch users
    Promise.all(
      participant_ids
      .map(userID => UserLoader.get(userID))
    ).then(results => {
      let names = results
        .filter(u => u._id !== skygear.currentUser.id)
        .map(u => u.displayName)
        .join(', ');
      if (names.length > 30) {
        names = names.substring(0,27) + '...';
      }
      let users = {};
      results.forEach(user => {
        users[user._id] = user;
      });
      this.setState({
        title: title || names,
        users,
      });
    });
    // subscribe to typing events
    skygearChat.subscribeTypingIndicator(
      this.props.conversation,
      this.typingEventHandler.bind(this)
    );
  }
  componentDidUpdate() {
    // scroll to the bottom
    const messageView = document.getElementById('message-view');
    messageView.scrollTop = messageView.scrollHeight;
  }
  componentWillUnmount() {
    this.messageList.destroy();
    // FIXME: unsubscribe typing indicator when SDK is fixed.
    //skygearChat.unsubscribeTypingIndicator(
    //  this.props.conversation
    //);
  }
  typingEventHandler(event) {
    const {users} = this.state;
    for(let userID in event) {
      const _id = userID.split('/')[1];
      switch(event[userID].event) {
        case 'begin':
          users[_id].typing = true;
          break;
        case 'finish':
          users[_id].typing = false;
          break;
      }
    }
    this.setState({users});
  }
  sendMessage(messageBody) {
    if(messageBody.length > 0) {
      skygearChat.createMessage(
        this.props.conversation,
        messageBody,
      ).then(message => {
        this.messageList.add(message);
      });
      // force update the conversation
      // after a new message is added
      skygearChat.updateConversation(
        this.props.conversation
      );
    }
  }
  render() {
    const {
      props: {
        showDetails,
        conversation: {
          participant_count,
        },
      },
      state: {
        title,
        users,
      },
      messageList,
    } = this;
    const currentUserID = skygear.currentUser && skygear.currentUser.id;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '75%',
          height: '100%',
        }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '6rem',
            borderBottom: '1px solid #000',
          }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <span></span>
            <div
              style={{
                textAlign: 'center',
                fontSize: '1.5rem'
              }}>
              <strong>{title}</strong> {` (${participant_count} people)`} <br/>
              <span style={{fontSize: '1rem'}}>
                {
                  (_ => {
                    const typingUsers =
                      Object.keys(users)
                      .map(k => users[k])
                      .filter(u => u._id !== currentUserID)
                      .filter(u => u.typing)
                      .map(u => u.displayName)
                      .join(', ');
                    return (typingUsers === '')? '' : `${typingUsers} is typing...`;
                  })()
                }
              </span>
            </div>
            <img
              style={{
                height: '2rem',
                cursor: 'pointer',
                marginRight: '2rem',
              }}
              onClick={showDetails}
              src="img/info.svg"/>
          </div>
        </div>
        <div
          id="message-view"
          style={{
            height: '100%',
            width: '100%',
            overflowX: 'hidden',
            overflowY: 'scroll',
          }}>
          {
            messageList.map((m) => (
              <Message
                key={m.id + m.updatedAt}
                message={m}/>
            ))
          }
        </div>
        <div
          style={{
            width: '100%',
            height: '5rem',
            display: 'flex',
            alignItems: 'center',
            borderTop: '1px solid #000',
          }}>
          <form
            style={{
              width: '100%',
              margin: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onSubmit={e => {
              e.preventDefault();
              this.sendMessage(e.target[0].value);
              e.target[0].value = '';
            }}>
            <input
              style={{
                padding: '0.25rem',
                fontSize: '1rem',
                width: '100%',
              }}
              onChange={_ => this.detectTyping()}
              type="text"/>
            <input
              style={{
                backgroundColor: '#FFF',
                border: '1px solid #000',
                padding: '0.5rem 1rem',
                marginLeft: '1rem',
              }}
              value="Send"
              type="submit"/>
          </form>
        </div>
      </div>
    );
  }
}