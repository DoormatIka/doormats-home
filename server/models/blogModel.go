package models

type BlogRecord struct {
	Id string `json:"id"`
	Title string `json:"title" binding:"required"`
	Link string `json:"link"`
	Text string `json:"text" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type BlogParams struct {
	Title string `json:"title" binding:"required"`
	Link string `json:"link"`
	Text string `json:"text" binding:"required"`
	Description string `json:"description" binding:"required"`
}
