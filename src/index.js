'use strict';

import React from 'react';
import filter from 'lodash/collection/filter';
import remove from 'lodash/array/remove';
import findIndex from 'lodash/array/findIndex';

import cloneWithClasses from './clone-with-classes';
import isIn from './is-in';
import mergeChildren from './merge-children';

const TransitionManager = React.createClass({
  displayName: 'TransitionManager',
  getInitialState() {
    const children = this.getChildren(this.props.children);
    return {
      adding: [],
      entering: [],
      leaving: [],
      children: children.map(child => cloneWithClasses(child, this.getClasses('shown')))
    };
  },
  getDefaultProps() {
    return {
      component: 'span'
    };
  },
  getChildren(children) {
    return children ? [].concat(children) : [];
  },
  componentWillReceiveProps(newProps) {
    const state = this.state;
    const targetChildren = this.getChildren(newProps.children);
    const currentLeaving = state.leaving;
    const currentAdding = state.adding;
    const currentChildren = state.children;
    const currentEntering = state.entering;
    const targetLeaving = filter(currentChildren, child => !isIn(child, targetChildren));
    const targetAdding = filter(targetChildren, child => (isIn(child, currentAdding) && !isIn(child, targetLeaving)) || !isIn(child, currentChildren));
    const targetEntering = filter(targetChildren, child => (isIn(child, currentEntering) && !isIn(child, targetLeaving)) || isIn(child, currentLeaving));
    const persisting = filter(currentChildren, child => !isIn(child, targetAdding) && !isIn(child, targetEntering) && !isIn(child, targetLeaving));
    const children = mergeChildren(currentChildren, targetChildren, persisting, targetEntering);
    this.setState({
      adding: targetAdding,
      entering: targetEntering,
      leaving: targetLeaving,
      children: children.map(child => isIn(child, targetEntering) ? cloneWithClasses(child, ['add']) : child)
    });
  },
  render() {
    return React.createElement(
      this.props.component,
      this.props,
      this.state.children.map(child => React.cloneElement(child, {
        ref: child.key
      }))
    );
  },
  timers: {
    adding: {},
    entering: {},
    leaving: {}
  },
  getClasses(componentState) {
    let classes = 'add';
    switch(componentState) {
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
  },
  componentDidUpdate() {
    this.state.adding.forEach((child) => {
      const key = child.key;

      // if doesn't exist, start an add timeout
      if(!this.timers.adding[key]) {
        this.timers.adding[key] = setTimeout(() => {
          const state = this.state;
          const component = remove(state.adding, {
            key: key
          })[0];
          const newComponent = cloneWithClasses(component, this.getClasses('show'));

          clearTimeout(this.timers.adding[key]);
          delete this.timers.adding[key];
          state.entering.push(component);
          state.children.splice(findIndex(state.children, 'key', key), 1, newComponent);
          this.setState(state);
        }, 10);
      }
    });

    this.state.entering.forEach((child) => {
      const key = child.key;

      // remove any existing leave timeouts
      if(this.timers.leaving[key]) {
        clearTimeout(this.timers.leaving[key]);
        delete this.timers.leaving[key];
      }

      // if doesn't exist, start an enter timeout
      if(!this.timers.entering[key]) {
        this.timers.entering[key] = setTimeout(() => {
          const state = this.state;
          const component = remove(state.entering, {
            key: key
          })[0];
          const newComponent = cloneWithClasses(component, this.getClasses('shown'));

          clearTimeout(this.timers.entering[key]);
          delete this.timers.entering[key];
          state.children.splice(findIndex(state.children, 'key', key), 1, newComponent);
          this.setState(state);
        }, this.props.duration);
      }
    });

    this.state.leaving.forEach((child) => {
      const key = child.key;

      // remove any existing enter timeouts
      if(this.timers.entering[key]) {
        clearTimeout(this.timers.entering[key]);
        delete this.timers.entering[key];
      }

      // if doesn't exist, start a leave timeout
      if(!this.timers.leaving[key]) {
        this.refs[key].componentWillLeave && this.refs[key].componentWillLeave();
        this.timers.leaving[key] = setTimeout(() => {
          const state = this.state;
          remove(state.leaving, {
            key: key
          });
          remove(state.children, {
            key: key
          });

          clearTimeout(this.timers.leaving[key]);
          delete this.timers.leaving[key];
          this.setState(state);
        }, this.props.duration);
      }
    });
  },
});

export default TransitionManager;
