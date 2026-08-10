# The Unicorns Renovate Shareable Config

> An Renovate [Shareable Config Preset](https://docs.renovatebot.com/config-presets/)

## Usage

You can use it by specifying `github>the-unicorns/renovate-config` in the extends section of your [Renovate configuration file](https://docs.renovatebot.com/configuration-options/).

```js
{
  "extends": [
    "github>the-unicorns/renovate-config"
   ]
}
```

## Release age

npm updates are held back for three days via
[`security:minimumReleaseAgeNpm`](https://docs.renovatebot.com/presets-security/#securityminimumreleaseagenpm),
which leaves room for a malicious or broken release to be caught and unpublished
before a PR ever opens. It also keeps Renovate's PRs clear of pnpm 11's own
one-day `minimumReleaseAge` default, which otherwise rejects the lockfile at
install time.

To opt a dependency out, set `minimumReleaseAge` to `null` in a package rule.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Contributors

- [View Contributors](https://github.com/the-unicorns/renovate-config/graphs/contributors)

## License

[MIT](LICENSE)
