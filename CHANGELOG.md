# CHANGELOG

## v0.7.0

### FEATURES

- Convert command args to '' if they're null or undefined

## v0.6.0

### FEATURES

- Allow users to manually call `RedisClient.authenticate(password)`
- Start writing tests and documentation

## v0.5.0

### FEATURES

- Support authentication

## v0.4.0

### FEATURES

- Add options parameter to `RedisClient`
- Add `RedisClient.callOne()`, similar to `RedisClient.call()` but takes a command as an array as the 1st parameter

## v0.3.0

### FEATURES

- Automatically convert command arguments to strings
- Increase waiting timeout of `connect()` and `disconnect()` of `RedisClient`

## v0.2.0

### FEATURES

- Fully support Promise

## v0.1.0

### FEATURES

- Fork Red from _djanowski/yoredis_ with basic features of a Redis client
- Vastly refactor codebase

### PATCHES

- A minor bug associated with "completed" state of a failed `PipelineOperation`
