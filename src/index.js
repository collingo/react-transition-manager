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
      removing: [],
      leaving: [],
      children: children.map(child => cloneWithClasses(child, 'shown'))
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
    const currentRemoving = state.removing;
    const currentLeaving = state.leaving;
    const currentAdding = state.adding;
    const currentEntering = state.entering;
    const currentChildren = state.children;
    const targetRemoving = filter(currentChildren, child => !isIn(child, targetChildren) && !isIn(child, currentLeaving));
    const targetLeaving = filter(currentChildren, child => !isIn(child, targetChildren) && !isIn(child, targetRemoving));
    const targetAdding = filter(targetChildren, child => (isIn(child, currentAdding) && !isIn(child, targetRemoving) && !isIn(child, targetLeaving)) || !isIn(child, currentChildren));
    const targetEntering = filter(targetChildren, child => (isIn(child, currentEntering) && !isIn(child, targetRemoving) && !isIn(child, targetLeaving)) || isIn(child, currentLeaving));
    const persisting = filter(currentChildren, child => !isIn(child, targetAdding) && !isIn(child, targetEntering) && !isIn(child, targetRemoving) && !isIn(child, targetLeaving));
    const children = mergeChildren(currentChildren, targetChildren, persisting, targetEntering, targetLeaving);
    this.setState({
      adding: targetAdding,
      entering: targetEntering,
      removing: targetRemoving,
      leaving: targetLeaving,
      children: children.map(child => isIn(child, targetEntering) ? cloneWithClasses(child, 'add') : child)
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
    removing: {},
    leaving: {}
  },
  componentDidUpdate() {
    this.state.adding.forEach((child) => {
      const key = child.key;

      // if doesn't exist, start an add timeout
      if(!this.timers.adding[key]) {
        this.timers.adding[key] = setTimeout(this.childAdded(key), 100);
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
        this.timers.entering[key] = setTimeout(this.childEntered(key), this.props.duration);
      }
    });

    this.state.removing.forEach((child) => {
      const key = child.key;

      // if doesn't exist, start an add timeout
      if(!this.timers.removing[key]) {
        this.timers.removing[key] = setTimeout(this.childRemoved(key), 100);
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
        this.timers.leaving[key] = setTimeout(this.childLeft(key), this.props.duration);
      }
    });
  },
  childAdded(key) {
    return () => {
      const state = this.state;
      if(isIn({ key: key }, state.adding)) {
        const component = remove(state.adding, {
          key: key
        })[0];
        const newComponent = cloneWithClasses(component, 'show');

        clearTimeout(this.timers.adding[key]);
        delete this.timers.adding[key];
        state.entering.push(newComponent);
        state.children.splice(findIndex(state.children, 'key', key), 1, newComponent);
        this.setState(state);
      }
    };
  },
  childEntered(key) {
    return () => {
      const state = this.state;
      if(isIn({ key: key }, state.entering)) {
        const component = remove(state.entering, {
          key: key
        })[0];
        const newComponent = cloneWithClasses(component, 'shown');

        clearTimeout(this.timers.entering[key]);
        delete this.timers.entering[key];
        state.children.splice(findIndex(state.children, 'key', key), 1, newComponent);
        this.setState(state);
      }
    };
  },
  childRemoved(key) {
    return () => {
      const state = this.state;
      if(isIn({ key: key }, state.removing)) {
        const component = remove(state.removing, {
          key: key
        })[0];
        const newComponent = cloneWithClasses(component, 'hide');

        clearTimeout(this.timers.removing[key]);
        delete this.timers.removing[key];
        state.leaving.push(newComponent);
        state.children.splice(findIndex(state.children, 'key', key), 1, newComponent);
        this.setState(state);
      }
    };
  },
  childLeft(key) {
    return () => {
      const state = this.state;
      if(isIn({ key: key }, state.leaving)) {
        remove(state.leaving, {
          key: key
        });
        remove(state.children, {
          key: key
        });

        clearTimeout(this.timers.leaving[key]);
        delete this.timers.leaving[key];
        this.setState(state);
      }
    };
  }
});

export default TransitionManager;
