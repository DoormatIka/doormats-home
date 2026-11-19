package models

type BlogRecord struct {
	Id string `json:"id"`
	Title string `json:"title"`
	Link string `json:"link"`
	Text string `json:"text"`
}
