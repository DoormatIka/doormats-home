package scripts

import (
	"database/sql"
	"log"
)

func createDB(db *sql.DB) {
	_, err := db.Exec(`create table 'blogs' (
	  'id' integer not null primary key autoincrement,
	  'title' TEXT not null,
	  'text' TEXT not null,
	  'link' TEXT null,
	  unique ('id')
	)`);

	if err != nil {
		log.Fatal(err);
	}
}
