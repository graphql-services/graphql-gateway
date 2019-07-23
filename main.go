package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/nautilus/gateway"
	"github.com/nautilus/graphql"
)

func withAuthorization(handler http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		handler.ServeHTTP(w, r.WithContext(
			context.WithValue(r.Context(), "authorization", auth),
		))
	})
}

var forwardAuthorization = gateway.RequestMiddleware(func(r *http.Request) error {
	if auth := r.Context().Value("authorization"); auth != nil {
		r.Header.Set("Authorization", auth.(string))
	}
	return nil
})

func getENVArray(name string) []string {
	arr := []string{}

	val := os.Getenv(name)
	if val != "" {
		arr = append(arr, strings.Split(val, ",")...)
	}

	for i := 0; i < 100; i++ {
		key := fmt.Sprintf("%s_%d", name, i)
		sval := os.Getenv(key)
		if sval != "" {
			arr = append(arr, sval)
		}
	}

	return arr
}

func main() {
	// introspect the apis
	schemas, err := graphql.IntrospectRemoteSchemas(
		getENVArray("GRAPHQL_URL")...,
	)
	if err != nil {
		panic(err)
	}

	// create the gateway instance
	gw, err := gateway.New(schemas, gateway.WithMiddlewares(forwardAuthorization))
	if err != nil {
		panic(err)
	}

	// add the playground endpoint to the router
	http.HandleFunc("/graphql", withAuthorization(gw.PlaygroundHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "80"
	}

	// start the server
	log.Printf("connect to http://localhost:%s/graphql for GraphQL playground", port)
	err = http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println(err.Error())
	}
}
