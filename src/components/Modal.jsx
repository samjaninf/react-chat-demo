import React from 'react';

export default function Modal({
  header,   // Modal header text
  onClose,  // modal close action handler fn
  children  // DOM elements inside modal
}) {
  return (
    <div
      style={Styles.backDrop}>
      <div
        style={Styles.container}>
        <header>
          <span
            style={Styles.close}
            onClick={onClose}>
            ×
          </span>
          <h1 style={Styles.heading}>
            {header}
          </h1>
        </header>
        {children}
      </div>
    </div>
  );
}

const Styles = {
  backDrop: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },

  container: {
     position: 'relative',
     backgroundColor: '#FFF',
     padding: '1rem',
     maxHeight: '90%',
     overflowY: 'scroll'
  },

  close: {
    color: '#777',
    fontSize: '2rem',
    cursor: 'pointer',
    position: 'absolute',
    right: '1.2rem',
    top: '1rem'
  },

  heading: {
    textAlign: 'center',
    margin: '0'
  }
}
