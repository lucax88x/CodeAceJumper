# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

Initial release

## [1.1.0]

New group system when we have more matches than the alphabet can have (26) [details](https://github.com/lucax88x/CodeAceJumper/issues/6)

## [1.1.1]

using SVG instead of TEXT for the decorations, this means a HUGE performance boost

## [1.1.2]

thanks to [ncthis](https://github.com/lucax88x/CodeAceJumper/pull/8) we now are able to make ace jump placeholders only for a "range" where the cursor is, instead of full page. Genius workaround until vscode releases the APIs for getting only viewable area of the screen.

## [1.1.3]

placeholder now have more configurations, such has font size, family, etc
added ', " and < in the pattern

## [1.1.4]

- Added new command that let Ace Jump [details](https://github.com/lucax88x/CodeAceJumper/issues/6)
- Correctly disposing the `AceJump: Type` and `AceJump: Jump To messages`

## [1.1.5]

- possibility to search inside words using the new setting `aceJump.finder.onlyInitialLetter=false`
- possibility to skip the search on the selections using the new setting `aceJump.finder.skipSelection=true`

## [1.1.6]

- Resolve non-intuitive behavior when search query matches separator regex [details](https://github.com/lucax88x/CodeAceJumper/pull/20)

## [1.1.7]

- Fixed "AceJump: Jump To" message always in status bar #18 [details](https://github.com/lucax88x/CodeAceJumper/issues/18)

## [1.1.8]

- Now the icon does not move the charaters in vscode anymore #23 [details](https://github.com/lucax88x/CodeAceJumper/issues/23)

## [1.1.9]

- Now uses a new vscode api for detecing the visible ranges in the screen [details](https://github.com/lucax88x/CodeAceJumper/issues/5)

## [1.1.10]

- Now should work together with extensions using the TYPE command (like VIM extensions) thanks to [matklad](https://github.com/lucax88x/CodeAceJumper/pull/25)

## [2.0.0]

- Total refactor of the code
- added a new command that support multichar [info](https://github.com/lucax88x/CodeAceJumper/issues/21)

## [2.0.1]

- if while restricting we don't match a letter but we match a placeholder we jump directly for it

## [2.1.0]

- dimming the editor when we start to ace jump, can be disabled with `aceJump.dim.enabled`

## [2.1.1]

- reduced bundle size with webpack

## [2.1.2]

- fixes [bug](https://github.com/lucax88x/CodeAceJumper/issues/29)

## [2.1.3]

- fixes [bug](https://github.com/lucax88x/CodeAceJumper/issues/30)

## [2.1.4]

- changed way to render highlights in the multichar and removed the limitation of 10

## [2.1.5]

- now it uses full power of vscode api for multiple visible areas, for example when we collapse functions or classes

## [2.1.6]

- updated readme, thanks to [pr](https://github.com/lucax88x/CodeAceJumper/pull/35)
- audited node packages for security
- when set to "only initial letter", first word of each line now works even with tabs indentation, [issue](https://github.com/lucax88x/CodeAceJumper/issues/33)

## [2.1.7]

- audited node packages for security
- when using "selection mode", correctly selects also last character, [issue](https://github.com/lucax88x/CodeAceJumper/issues/108)

## [2.1.8]

- fixed [#34](https://github.com/lucax88x/CodeAceJumper/issues/34)
- fixed [#153](https://github.com/lucax88x/CodeAceJumper/issues/153)

## [2.2.0]

- fixed [#160](https://github.com/lucax88x/CodeAceJumper/issues/160)
- implemented [#151](https://github.com/lucax88x/CodeAceJumper/issues/151)
![video](https://media.giphy.com/media/jUQixLErR27iPssBYq/giphy.gif)
