package main

import (
	"bytes"
	"strings"
	"os/exec"
	"math/big"
	"log"
	"net/http"
	"io"
)

func main() {
	// Hello world, the web server

	helloHandler := func(w http.ResponseWriter, req *http.Request) {
		req.ParseForm()
		q ,_:= big.NewInt(0).SetString(req.FormValue("q"),10)
		// Next prime power
		c := exec.Command("gp","-q","gp/nextprimepower.gp")
		c.Stdin = strings.NewReader(q.Text(10))
		var out bytes.Buffer
		c.Stdout = &out
		c.Run()
		q.SetString(out.String(),10)
		// TODO: find best matching q in SIAVdb
		io.WriteString(w,q.Text(10))
	}

	http.HandleFunc("/hello", helloHandler)
	log.Fatal(http.ListenAndServe(":8081", nil))
}