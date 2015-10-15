import React from 'react';
import classnames from 'classnames/dedupe';

function getClasses(state) {
  let classes = 'add';
  switch(state) {
    case 'show':
      classes += ' show';
      break;
    case 'shown':
      classes += ' show shown';
      break;
    case 'hide':
      classes += ' show shown hide';
      break;
  }
  return classes;
}

export default function cloneWithClasses(element, state) {
  let currentClasses = element.props.className ? element.props.className.split(' ') : [];
  let newClasses = classnames.apply(null, currentClasses.concat(getClasses(state)));
  const newElement = React.cloneElement(element, {
    className: newClasses,
    transitionState: state
  });
  return newElement;
}
