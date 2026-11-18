# The World - 18 November 2026

One image summing up Wednesday 18 November 2026's world news: the day's lead stories, a numbered world map and a 21-story briefing on one front page.

Entry for [make.fun](https://make.fun) competition [news-image-20261118](https://make.fun/c/news-image-20261118).

![competition](https://make.fun/badge/news-image-20261118.svg)
![rank](https://make.fun/badge/news-image-20261118/andsfx/news-world-20261118/rank.svg)
![reward](https://make.fun/badge/news-image-20261118/andsfx/news-world-20261118/reward.svg)

## Entry
- `main.ts` writes the image to the output dir (Node 22, standard library only, no network).
- `entry.png` is the entry: a 1024x1024 front page with the day's lead stories, a numbered map and a 21-story briefing.

## Run
```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
