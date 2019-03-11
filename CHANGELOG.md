# CHANGELOG

## v0.4.0

- NEW: Add options parameter to `RedisClient`
- NEW: Add `RedisClient.callOne()`, similar to `RedisClient.call()` but takes a command as an array as the 1st parameter

## v0.3.0

- NEW: Automatically convert command arguments to strings
- CHANGED: Increase waiting timeout of connect() and disconnect() of `RedisClient`

## v0.2.0

- NEW: Fully support Promise

## v0.1.0

- NEW: Fork Red from _djanowski/yoredis_ with basic features of a Redis client
- CHANGED: Vastly refactor codebase
- FIXED: A minor bug envolved in "completed" state of a failed `PipelineOperation`
