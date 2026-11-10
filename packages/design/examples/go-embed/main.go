// A Go server that embeds the Kairos design stylesheets and serves a page
// with them, the way the Kairos web installer ships its UI inside the ISO.
// Copy dist/tokens.css and dist/components.css next to this file (or vendor
// them from node_modules/@kairos-io/design/dist) and run `go run .`.
package main

import (
	"embed"
	"log"
	"net/http"
)

//go:embed tokens.css components.css index.html
var assets embed.FS

func main() {
	http.Handle("/", http.FileServer(http.FS(assets)))
	log.Println("listening on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
