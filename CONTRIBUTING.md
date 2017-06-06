# Contributions Welcome

Feel free to make suggestions and share improvements on the [issues]().

# Cell Architecture

For a quick overview of how Cell works internally, please refer to the [Genesis](GENESIS.md) document, where it explains every module in detail.

# Tests Required!

Because Cell creates HTML elements that are completely self-driving, it can be tricky at times to debug when something goes wrong.

That's why it is necessary to write as much test as possible, in order to make sure one fix or improvement doesn't result in an unexpected trouble elsewhere.

So when you do make a contribution, please write a test that verifies that:

1. Your code does what you say it does.
2. Your code doesn't break rest of the existing tests.

You can check out all the existing tests under the [/tests]() folder.
