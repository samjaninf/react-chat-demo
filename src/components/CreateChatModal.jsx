import React from 'react';
import skygear from 'skygear';
import skygearChat from 'skygear-chat';

import Modal from './Modal.jsx';

export default class CreateChatModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      errorMessage: ''
    };
  }
  discoverUserAndCreateChat(username) {
    this.setState({loading: true});
    skygear.discoverUserByUsernames(
      username
    ).then(users => {
      if (users.length <= 0) {
        return Promise.reject({message: `user "${username}" not found`});
      }
      return skygearChat.createDirectConversation(users[0], null);
    }).then(conversation => {
      // close modal after creation
      this.props.onClose();
      this.props.addConversationDelegate(conversation);
    }).catch(err => {
      this.setState({
        loading: false,
        errorMessage: `Error: ${err.message}`
      });
    });
  }
  render() {
    const {
      props: {
        onClose
      },
      state: {
        loading,
        errorMessage
      }
    } = this;
    return (
      <Modal
        header="Create Direct Chat"
        onClose={onClose}>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.discoverUserAndCreateChat(
              e.target[0].value
            );
          }}
          style={Styles.formContainer}>
          <label>Username</label>
          <input
            disabled={loading}
            type="text"/>
          <p>{errorMessage}</p>
          <div style={Styles.buttonContainer}>
            <input
              style={Styles.startButton}
              disabled={loading}
              type="submit"
              value="Start" />
          </div>
        </form>
      </Modal>
    );
  }
}

const Styles = {
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '21rem',
    padding: '3rem 3rem 1rem'
  },

  buttonContainer: {
    alignSelf: 'flex-end'
  },

  startButton: {
    backgroundColor: '#FFF',
    border: '1px solid #000',
    padding: '0.5rem 1rem'
  }
}
