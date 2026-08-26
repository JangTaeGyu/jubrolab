## Kiply

- [배포전] https://kiply.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/kiply

## INK ARENA

- https://ink-arena.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/splatoon

## Paperdoll

- https://paperdoll.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/paperdoll


## Specast

- [배포전] https://Specast.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/specast

## Token Generator

- https://token-generator.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/token-generator

## Text2 Visual

- https://text2visual.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/text-to-visual

## Story Hacker

- https://story-hacker.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/story-hacker

## Koda CLI

- https://koda-cli.jubrolab.dev/ — 소개 페이지 한 장. 쓰는 것은 여전히 터미널이다
  (`npm i -g git+https://github.com/JangTaeGyu/koda-cli.git`)
- /Users/jangtaegyu/Desktop/ToyProject/koda-cli
  - 아이콘도 OG 도 그 소개 페이지에 딸려 저장소 안으로 들어왔다
    (`site/favicon.svg` · `site/og.png`). 아이콘은 `collect-icons.mjs` 의 `SOURCES`
    가 가져가고, OG 는 파일을 그대로 `public/og/koda-cli.png` 로 복사한다.
    둘 다 여기서 그리던 것을 지웠다.

## RIM RATS

- https://rim-rats.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/rim-rats
  - 아이콘도 OG 도 저장소 안에 있다 (`assets/icon-512.png` · `assets/og.png`).
    둘 다 `tools/gen_brand.py` 가 굽는 것이라, 원본이 바뀌면 그쪽을 먼저 다시 돌린다.
    OG 는 파일을 그대로 `public/og/rim-rats.png` 로 복사한다.

## Impastile

- https://impastile.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/impastile
  - OG 카드가 저장소에 파일로 없다 — `app/opengraph-image.tsx` 가 빌드 때 굽는다.
    그래서 배포본에서 받아 온다: `curl -o public/og/impastile.png
    https://impastile.jubrolab.dev/opengraph-image`

## Bannerholm

- https://bannerholm-studio.jubrolab.dev/
- /Users/jangtaegyu/Desktop/ToyProject/bannerholm
  - 스튜디오는 /Users/jangtaegyu/Desktop/ToyProject/bannerholm/apps/studio
  - Impastile 과 같다 — OG 카드가 파일이 아니라 `app/opengraph-image.tsx` 라
    배포본에서 받아 온다: `curl -o public/og/bannerholm.png
    https://bannerholm-studio.jubrolab.dev/opengraph-image`
  - 아이콘도 파일이 아니다. 마크가 `apps/studio/src/lib/brandMark.ts` 의 문자열이라
    `collect-icons.mjs` 의 `DRAWN` 에 같은 도형을 옮겨 적어 굽는다.
