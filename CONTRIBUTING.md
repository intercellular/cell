# Contributions Welcome

Feel free to make suggestions and share improvements on the [issues](https://github.com/intercellular/cell/issues/new).

# Cell Architecture

For a quick overview of how Cell works internally, please refer to the [Genesis](./GENESIS.md) document, where it explains every module in detail.

# Tests Required!

Because Cell creates HTML elements that are completely self-driving, it can be tricky at times to debug when something goes wrong.

That's why it is necessary to write as many tests as possible, in order to make sure one fix or improvement doesn't result in unexpected trouble elsewhere.

So when you do make a contribution, please write a test verifing that:

1. Your code does what you say it does.
2. Your code doesn't break any of the existing tests.

You can check out all the existing tests under the [/test](./test) folder.
