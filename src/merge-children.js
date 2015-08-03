import cloneWithClasses from './clone-with-classes';
import isIn from './is-in';

function mergeChildren(currentChildren, targetChildren, persisting, targetEntering) {
  let targetIndex = 0;
  let currentIndex = 0;
  let targetChild = targetChildren[targetIndex];
  let currentChild = currentChildren[currentIndex];
  let children = [];
  while(targetChild || currentChild) {
    while(targetChild && !isIn(targetChild, persisting)) {
      let classes = isIn(targetChild, targetEntering) ? ['add', 'show'] : ['add']
      children.push(cloneWithClasses(targetChild, classes));
      targetChild = targetChildren[++targetIndex];
    }
    while(currentChild && !isIn(currentChild, persisting)) {
      if(!isIn(currentChild, children)) {
        children.push(cloneWithClasses(currentChild, ['add', 'show', 'hide']));
      }
      currentChild = currentChildren[++currentIndex];
    }
    if(targetChild) {
      children.push(cloneWithClasses(targetChild, ['add', 'show', 'shown']));
      targetChild = targetChildren[++targetIndex];
      currentChild = currentChildren[++currentIndex];
    }
  }
  return children;
}

export default mergeChildren;
