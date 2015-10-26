import cloneWithClasses from './clone-with-classes';
import isIn from './is-in';

function mergeChildren(currentChildren, targetChildren, persisting, targetEntering, targetLeaving) {
  let targetIndex = 0;
  let currentIndex = 0;
  let targetChild = targetChildren[targetIndex];
  let currentChild = currentChildren[currentIndex];
  let children = [];
  while(targetChild || currentChild) {
    while(targetChild && !isIn(targetChild, persisting)) {
      let state = isIn(targetChild, targetEntering) ? 'show' : 'add';
      children.push(cloneWithClasses(targetChild, state));
      targetChild = targetChildren[++targetIndex];
    }
    while(currentChild && !isIn(currentChild, persisting)) {
      if(!isIn(currentChild, children)) {
        let state = isIn(currentChild, targetLeaving) ? 'hide' : 'remove';
        children.push(cloneWithClasses(currentChild, state));
      }
      currentChild = currentChildren[++currentIndex];
    }
    if(targetChild) {
      children.push(cloneWithClasses(targetChild, 'shown'));
      targetChild = targetChildren[++targetIndex];
      currentChild = currentChildren[++currentIndex];
    }
  }
  return children;
}

export default mergeChildren;
