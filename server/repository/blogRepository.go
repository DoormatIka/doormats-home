package repository;

import (
	"server/models"
	"database/sql"
	"log"
)

type BlogRepository struct {
	db *sql.DB
}

func NewBlogRepository(db *sql.DB) *BlogRepository {
	return &BlogRepository{db: db}
}

func (r *BlogRepository) Add(title string, link string, text string) (error) {
	_, err := r.db.Exec(
		"INSERT INTO blogs (title, link, text) VALUES (?)",
		title, link, text,
	);
	if err != nil {
		log.Fatal(err);
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

func (r *BlogRepository) Get(id string) (models.BlogRecord, error) {
	var blog models.BlogRecord;
	err := r.db.QueryRow("SELECT * FROM blogs WHERE id = ?", id).Scan(&blog);
	if err != nil {
		log.Fatal(err)
	}
	return models.BlogRecord{}, nil;
}

func (r *BlogRepository) Update(id string) (bool, error) {
	// TODO. Figure out if this should go on service or on repository.
	return false, nil;
}

func (r *BlogRepository) List(page uint) ([]models.BlogRecord, error) {
	rows, err := r.db.Query("SELECT * FROM blogs ORDER BY id LIMIT ? OFFSET ?", 10, page * 10);
	if err != nil {
		log.Fatal(err);
		return nil, err;
	}
	defer rows.Close();

	var blogs []models.BlogRecord
	for rows.Next() {
		var b models.BlogRecord
		if err := rows.Scan(&b.Id, &b.Link, &b.Text, &b.Title); err != nil {
			log.Fatal(err)
			return nil, err;
		}
		blogs = append(blogs, b)
	}
	return blogs, rows.Err()
}
