import React from 'react';
import classnames from 'classnames/dedupe';

export default function cloneWithClasses(element, classes) {
  let currentClasses = element.props.className ? element.props.className.split(' ') : [];
  let newClasses = classnames.apply(null, currentClasses.concat(classes));
  const newElement = React.cloneElement(element, {
    className: newClasses
  });
  return newElement;
}
