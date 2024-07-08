# Mina zkApp: Sliced.club

This template uses TypeScript.

# How to look at the tests

`GroupBasic.test.ts` is the test file for the happy path of the whole group with multiple rounds.
`GroupId.test.ts` is the test file that covers more edge cases for the group as well as presents the group contract that would utilise zkAuth verification.

## How to build

```sh
npm run build
```

## How to run tests for the group

```sh
npm run basic
```

## How to run lightnode

```sh
zk lightnet start
```

## License

[Apache-2.0](LICENSE)
