'use strict';

import React from 'react';
import TransitionManager from '../src/index';

const noOfPages = 9;
const Demo = React.createClass({
  displayName: "Demo",
  getInitialState() {
    return {
      page: 0
    };
  },
  render() {
    const pageSlug = `page-${this.state.page}`;
    return (
      <div className={this.props.className}>
        <button onClick={this.onClickPrev}>Previous</button>
        <button onClick={this.onClickNext}>Next</button>
        <TransitionManager component="div" className="stage" duration={1000}>
          <div key={pageSlug} className={`page ${pageSlug}`}>{`Page ${this.state.page}`}</div>
        </TransitionManager>
      </div>
    );
  },
  onClickPrev() {
    this.setState({
      page: (noOfPages + this.state.page - 1) % noOfPages
    });
  },
  onClickNext() {
    this.setState({
      page: (noOfPages + this.state.page + 1) % noOfPages
    });
  }
});
const DemoPage = React.createClass({
  displayName: "DemoPage",
  render() {
    return (
      <div id="app">
        <h1>Transition Manager</h1>
        <p>See <a href="https://github.com/collingo/react-transition-manager">readme on Github</a> for usage instructions.</p>
        <p>See <a href="https://github.com/collingo/react-transition-manager/tree/master/demos">demos directory</a> in repo for the code behind these demos.</p>
        <h2>Demos</h2>
        <p>All three demos use the same JSX and only vary in style.</p>
        <article className="demo">
          <h3>No styles</h3>
          <p>Click next/previous quickly and you should see the DOM filling up with new pages. Multiple renders are taking place during this time but transitioning elements are not removed until their transition timeout is complete.</p>
          <Demo className="no-style" />
        </article>
        <article className="demo">
          <h3>Translate 1</h3>
          <p>A simple transition in the form of a translate from right to left. Overflow is visible to help visualise the transition.</p>
          <Demo className="translate" />
        </article>
        <article className="demo">
          <h3>Translate 2</h3>
          <p>Overflow hidden to complete the effect.</p>
          <Demo className="translate final" />
        </article>
        <article className="demo">
          <h3>Fade</h3>
          <p>Making use of opacity and transition-delay to create a fade effect.</p>
          <Demo className="fade" />
        </article>
      </div>
    );
  }
});

React.render(
  <DemoPage />,
  document.body
);
