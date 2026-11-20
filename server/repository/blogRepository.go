package repository

import (
	"database/sql"
	"log"
	"server/models"
)

type BlogRepository struct {
	db *sql.DB
}

func NewBlogRepository(db *sql.DB) *BlogRepository {
	return &BlogRepository{db: db}
}

func (r *BlogRepository) Add(params *models.BlogParams) (error) {
	log.Println(params)
	_, err := r.db.Exec(
		"INSERT INTO blogs (title, link, text) VALUES (?, ?, ?)",
		params.Title, params.Link, params.Text,
	);
	if err != nil {
		return err;
	}
	return nil
}

func (r *BlogRepository) Remove(id string) (bool, error) {
	res, err := r.db.Exec("DELETE FROM blogs WHERE id = ?", id);
	if err != nil {
		return false, err;
	}
	n, err := res.RowsAffected();
	if err != nil {
		return false, err;
	}
	return n > 0, nil;
}

func (r *BlogRepository) Get(id string) (*models.BlogRecord, error) {
	var blog models.BlogRecord;
	err := r.db.QueryRow("SELECT id, title, link, text, description FROM blogs WHERE id = ?", id).Scan(&blog.Id, &blog.Title, &blog.Link, &blog.Text, &blog.Description);
	if err != nil {
		return nil, err;
	}
	return &blog, nil;
}


func (r *BlogRepository) Update(id uint, params *models.BlogParams) (bool, error) {
	res, err := r.db.Exec(
		"UPDATE blogs SET title = COALESCE(?, title), link = COALESCE(?, link), text = COALESCE(?, text) WHERE id = ?",
		params.Title, params.Link, params.Text, id,
	)
	if err != nil {
		return false, err;
	}
	n, err := res.RowsAffected()
	if err != nil {
		return false, err;
	}
	return n > 0, nil;
}

func (r *BlogRepository) List(page uint) ([]models.BlogRecord, error) {
	rows, err := r.db.Query("SELECT * FROM blogs ORDER BY id LIMIT ? OFFSET ?", 10, page * 10);
	if err != nil {
		return nil, err;
	}
	defer rows.Close();

	var blogs []models.BlogRecord
	for rows.Next() {
		var b models.BlogRecord
		if err := rows.Scan(&b.Id, &b.Link, &b.Text, &b.Title); err != nil {
			return nil, err;
		}
		blogs = append(blogs, b)
	}
	return blogs, rows.Err()
}
