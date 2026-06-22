#!/bin/sh
set -e

CONTAINER=""

usage() {
    echo "usage: inject-ui.sh -c <container> [options]"
    echo ""
    echo "builds the web ui and injects it into a running slskd container"
    echo ""
    echo "options:"
    echo "  -h, --help                show this help"
    echo "  -c, --container <name>    container name or id (required)"
}

while test $# -gt 0; do
    case "$1" in
        -h|--help)
            usage
            exit 0
            ;;
        -c|--container)
            shift
            CONTAINER="$1"
            shift
            ;;
        *)
            echo "error: unknown option '$1'"
            echo ""
            usage
            exit 1
            ;;
    esac
done

if [ -z "$CONTAINER" ]; then
    echo "error: --container is required"
    echo ""
    usage
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR"
echo "building frontend..."
npm run build

echo "injecting build into container '$CONTAINER'..."
docker exec "$CONTAINER" sh -c 'rm -rf /slskd/wwwroot/* && mkdir -p /slskd/wwwroot'
docker cp dist/. "$CONTAINER":/slskd/wwwroot/

echo "done."
