package models

type BlogRecord struct {
	Id string `json:"id" binding:"required"`
	Title string `json:"title" binding:"required"`
	Link string `json:"link" binding:"required"`
	Text string `json:"text" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type BlogParams struct {
	Title string `json:"title" binding:"required"`
	Link string `json:"link" binding:"required"`
	Text string `json:"text" binding:"required"`
	Description string `json:"description" binding:"required"`
}
