## steps to make script:

```
cp -r cmd/example cmd/{migration-name}
```

implement your migration script in `cmd/{migration-name}/main.go`

if changing the model breaks old scripts, it doesn't matter since we don't re-run them, so don't worry

## ship it

sync this repo onto the cloud server

```
git pull
cd cmd/{migration-name}
go build -o build
rm -f output.txt
doppler run -- ./build/{migration-name} > output.txt
```
