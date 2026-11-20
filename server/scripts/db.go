package scripts

import (
	"database/sql"
	"log"
)

func createDB(db *sql.DB) {
	_, err := db.Exec(`create table 'blogs' (
	  'id' integer not null primary key autoincrement,
	  'title' TEXT not null default '',
	  'text' TEXT not null default '',
	  'description' TEXT not null default '',
	  'link' TEXT not null unique,
	  unique ('id')
	)`);

	if err != nil {
		log.Fatal(err);
	}
}
