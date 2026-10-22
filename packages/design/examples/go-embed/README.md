# go-embed

```
cp ../../dist/tokens.css ../../dist/components.css .
go run .
```

The CSS files are gitignored here; they come from the package build. This is
the same arrangement the Kairos web installer uses: the UI must render on a
machine with no network, so nothing is fetched at runtime.
