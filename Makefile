install:
	docker run -t --rm -v `pwd`:/app  -w /app node:13.7.0-alpine npm install

test:
	docker run -t --rm -v `pwd`:/app -w /app node:13.7.0-alpine npm run test

start:
	docker run -ti --rm -v `pwd`:/app -w /app -p 8080:8080 node:13.7.0-alpine npm run start -- --host=0.0.0.0

package:
	tar -zcvf ./docs/`git describe --abbrev=0 --tags`.tar.gz `git ls-tree -r master --name-only | sed '/docs/d'`
	cd docs && ln -sf ./`git describe --abbrev=0 --tags`.tar.gz ./latest.tar.gz && cd -
	cp ./README.md ./docs/README.md
	echo "# Release\n\n[MineSweeper-kata `git describe --abbrev=0 --tags`](https://evaneos.github.io/minesweeper-kata/latest.tar.gz)\n\n`cat ./docs/README.md`" > ./docs/README.md
