'use strict';

import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';

chai.use(sinonChai);

function cloneWithClasses (item, classes) {
  item.classes = classes;
  return item;
}

describe('mergeChildren', () => {

  let sandbox;
  let mergeChildren;
  let cloneWithClassesSpy;
  let child1;
  let child2;
  let child3;
  let child4;
  let child5;
  let result;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    cloneWithClassesSpy = sandbox.spy(cloneWithClasses);
    mergeChildren = proxyquire('../src/merge-children', {
      './clone-with-classes': {
        cloneWithClasses: cloneWithClassesSpy,
        getClonerForClasses: () => {}
      }
    });
    child1 = { key: 1 };
    child2 = { key: 2 };
    child3 = { key: 3 };
    child4 = { key: 4 };
    child5 = { key: 5 };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when no children', () => {
    beforeEach(() => {
      result = mergeChildren([], [], []);
    });
    it('should return an empty array', () => {
      expect(Array.isArray(result)).to.be.true;
      expect(result.length).to.equal(0);
    });
  });

  describe('when no changes', () => {
    beforeEach(() => {
      result = mergeChildren([child1], [child1], [child1]);
    });
    it('should return same children', () => {
      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(child1);
    });
    it('should add "show" classes to child', () => {
      expect(result[0].classes).to.include("add");
      expect(result[0].classes).to.include("show");
      expect(result[0].classes).to.not.include("hide");
    });
  });

  describe('when adding', () => {
    beforeEach(() => {
      result = mergeChildren([child1], [child1, child2], [child1]);
    });
    it('should return two children', () => {
      expect(result.length).to.equal(2);
    });
    it('should be in the correct order', () => {
      expect(result[0]).to.equal(child1);
      expect(result[1]).to.equal(child2);
    });
    it('should add "add" classes to new child', () => {
      expect(result[1].classes).to.include("add");
      expect(result[1].classes).to.not.include("show");
      expect(result[1].classes).to.not.include("hide");
    });
  });

  describe('when removing', () => {
    beforeEach(() => {
      result = mergeChildren([child1], [], []);
    });
    it('should return same children', () => {
      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(child1);
    });
    it('should add "hide" classes to old child', () => {
      expect(result[0].classes).to.include("add");
      expect(result[0].classes).to.include("show");
      expect(result[0].classes).to.include("hide");
    });
  });

  describe('when switching', () => {
    beforeEach(() => {
      result = mergeChildren([child1, child2], [child2, child1], [child1, child2]);
    });
    it('should return same children', () => {
      expect(result.length).to.equal(2);
    });
    it('should order children correctly', () => {
      expect(result[0]).to.equal(child2);
      expect(result[1]).to.equal(child1);
    });
    it('should maintain "show" classes to both children', () => {
      expect(result[0].classes).to.include("add");
      expect(result[0].classes).to.include("show");
      expect(result[0].classes).to.not.include("hide");
      expect(result[1].classes).to.include("add");
      expect(result[1].classes).to.include("show");
      expect(result[1].classes).to.not.include("hide");
    });
  });

  describe('when replacing', () => {
    beforeEach(() => {
      result = mergeChildren([child1], [child2], []);
    });
    it('should return all the children', () => {
      expect(result.length).to.equal(2);
    });
    it('should order children correctly', () => {
      expect(result[0]).to.equal(child2);
      expect(result[1]).to.equal(child1);
    });
    it('should add "add" classes to new child', () => {
      expect(result[0].classes).to.include("add");
      expect(result[0].classes).to.not.include("show");
      expect(result[0].classes).to.not.include("hide");
    });
    it('should add "hide" classes to old child', () => {
      expect(result[1].classes).to.include("add");
      expect(result[1].classes).to.include("show");
      expect(result[1].classes).to.include("hide");
    });
  });

  describe('when changes are split by a persisting child', () => {
    beforeEach(() => {
      result = mergeChildren([child1, child2, child3], [child4, child2, child5], [child2]);
    });
    it('should return all the children', () => {
      expect(result.length).to.equal(5);
    });
    it('should order children correctly', () => {
      expect(result[0]).to.equal(child4);
      expect(result[1]).to.equal(child1);
      expect(result[2]).to.equal(child2);
      expect(result[3]).to.equal(child5);
      expect(result[4]).to.equal(child3);
    });
  });

});
