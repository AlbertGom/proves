#!/bin/zsh
BIN_DIR=${0:a:h}
cd "$BIN_DIR" || exit

if [[ $# -lt 8 ]]; then
echo
echo You introduced $# parameters, 8 parameters  are necessary to run the script.
echo
	../node_modules/.bin/ts-node --files ../src/import-from-miro-to-contentful.ts --help
	exit 1
fi


MIRO_BOARD_ID=$1
MIRO_TOKEN=$2
USING_MIRO_LINKS=$3
CONTENTFUL_SPACE_ID=$4
CONTENTFUL_ENVIRONMENT=$5
CONTENTFUL_MANAGE_TOKEN=$6
CONTENTFUL_DELIVERY_TOKEN=$7
CONTENTFUL_LOCALE=$8


   ../node_modules/.bin/ts-node --files ../src/import-from-miro-to-contentful.ts "$MIRO_BOARD_ID" "$MIRO_TOKEN" "$USING_MIRO_LINKS" "$CONTENTFUL_SPACE_ID" "$CONTENTFUL_ENVIRONMENT" "$CONTENTFUL_MANAGE_TOKEN" "$CONTENTFUL_DELIVERY_TOKEN" "$CONTENTFUL_LOCALE"

