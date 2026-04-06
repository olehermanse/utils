# Common js / ts utilities for personal use

I use these across a few different projects;

- https://github.com/olehermanse/trpg
- https://github.com/olehermanse/tpg
- https://github.com/olehermanse/towers

## Publishing new versions

Here are the steps to make a new version:

1. Check that `package.json` has the correct version:
   https://github.com/olehermanse/utils/blob/main/package.json#L3
   - It should be the version you want to release.
   - Change it if necessary, for example to bump major or minor version.
2. Create a release in GitHub:
   - Open https://github.com/olehermanse/utils/releases
   - **Draft a new release**
   - Put the version number in both tag (create a new tag) and name field
   - **Generate release notes**
3. Check that the release has been published on npm:
   - https://www.npmjs.com/package/@olehermanse/utils
   - This is done automatically by the GitHub Action after creating a release.
4. Check that the version number has been bumped:
   - https://github.com/olehermanse/utils/commits/main/
   - The GitHub Action will automatically push a commit bumping the patch version.
   - Manually bump minor or major version if you know that is what you'll release next:
     - https://github.com/olehermanse/utils/blob/main/package.json#L3

Trusted publishing must be configured on npmjs.com there are no GH secrets / npm tokens.
