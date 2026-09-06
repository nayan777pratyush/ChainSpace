const { expect } = require('chai');

/**
 * Small ChainSpace smoke test kept as a simple example for contributors.
 * The feature-specific suites live beside this file.
 */
describe('ChainSpace smoke test', function () {
  it('runs the test suite with the expected assertion library', function () {
    expect('ChainSpace').to.equal('ChainSpace');
  });
});
