# TransitionManager

A robust transition component for React projects which can handle the stress. It can cope with multiple, simultaneous transitions being queued up in quick succession as well as changes to these part way through.

## Why?

I was looking for a transition component that allows for smooth page changes which can be tied to the browser history. Since the user can navigate the history at any rate they wish, the transition component would need to be able to juggle multiple transitions at a time. It seemed clear that any transitioning elements needed to be cached in some stateful manner in order to keep tabs on them between renders. Unfortunately none of the existing transition components seemed to support this idea, so subsequent renders would not be aware of any transitioning elements and they would be removed prematurely.

## How it works

Inspired by React's own [`ReactCSSTransitionGroup`](https://facebook.github.io/react/docs/animation.html) component, `TransitionManager` allows you to simply declare the children you want to see, leaving the nasty diffing logic to React. Additionally, to cope with transitionends not firing in certain cases, it employs a setTimeout safety net just as the clever [`TimeoutTransitionGroup`](https://github.com/Khan/react-components/blob/master/js/timeout-transition-group.jsx) from [Kahn Academy](https://www.khanacademy.org/). It will then keep track of all children in its internal state, whether they are entering, leaving or persisting, whilst adding classes to them to trigger the appropriate css transitions. Children are only removed after the timeout is complete and all timeouts are allowed to run to their conclusion regardless of the number of render calls taking place inbetween.

## Transition cycle

Children will receive the following classes at each stage of their transition cycle...

* `add` for new elements
  * prepare them for entry transition
* `add show` for entering elements
  * `show` is added on the next tick in order to trigger the enter css transition
* `add show hide` for leaving elements
  * `hide` is added in order to trigger the leave css transition
* element is removed from the dom after timeout duration

## Usage

Uses a similar api to `TimeoutTransitionGroup`, you need to pass in a duration value in ms for the leave timeouts. All children must have a unique `key` so `TransitionManager` can keep tabs on each child. E.g.

```
const Component = React.createClass({
  render() {
    let page;
    switch(this.props.pageId) {
      case 'home':
        page = <Home key="home" />;
        break;
      case 'about':
        page = <About key="about" />;
        break;
      case 'contact':
        page = <Contact key="contact" />;
        break;
    }
    return (
      <TransitionManager component="div" duration={1000}>
        {page}
      </TransitionManager>
    );
  }
});
```

* all passed props (`id`, `className` etc) will be applied to the rendered dom
* `component` attribute allows for overriding the default `<span>` element type.

## License
[MIT](http://opensource.org/licenses/MIT)
