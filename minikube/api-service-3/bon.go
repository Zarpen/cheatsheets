package main

import "github.com/gin-gonic/gin"
	
import (
    "math/rand"
)

func calculator(x int, y int) int {
	return x + y
}

func main() {
//     gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	value := rand.Intn(100)
    value2 := rand.Intn(50)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello from micro service 3 written in Go and Gin",
		})
	})
	r.GET("/randomadd", func(c *gin.Context) {
		c.JSON(200, gin.H{
		    "randomadd": calculator(value, value2),
		    "value": value,
		    "value2": value2,
		})
	})
	r.GET("/items/:item_id", func(c *gin.Context) {
		c.JSON(200, gin.H{
		    "item_id": c.Param("item_id"),
		})
	})
	r.Run("0.0.0.0:8001") // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}